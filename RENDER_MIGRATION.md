# Moving Nova (AI&U Platform) to Render

This guide covers everything needed to migrate the Nova platform off Replit and onto Render. No application code changes are required — only configuration and two infrastructure swaps (Clerk auth and file storage).

---

## Stack Overview

| Piece | Current (Replit) | Target (Render) |
|---|---|---|
| API Server | Replit workflow | Render Web Service |
| Nova frontend | Replit workflow | Render Static Site |
| PostgreSQL | Replit managed DB | Render managed PostgreSQL |
| Auth | Replit-managed Clerk | Your own Clerk account |
| File uploads | Local disk (`./uploads/`) | Cloudflare R2 or AWS S3 |

---

## Prerequisites

- GitHub account (Render deploys from a git repo)
- Render account — [render.com](https://render.com) (free tier works)
- Clerk account — [clerk.com](https://clerk.com) (free tier works)
- Cloudflare or AWS account for object storage (Cloudflare R2 is simpler and has a generous free tier)

---

## Step 1 — Push to GitHub

If the project isn't already on GitHub:

```bash
git init
git add .
git commit -m "initial"
gh repo create nova-platform --private --push --source=.
```

Or use the GitHub desktop app / Replit's Git panel.

---

## Step 2 — Create a Render PostgreSQL Database

1. In the Render dashboard → **New** → **PostgreSQL**
2. Name it `nova-db`, choose the free plan, pick a region close to you
3. After it provisions, go to the database detail page and copy the **Internal Database URL** — you'll use this as `DATABASE_URL` on both services

---

## Step 3 — Deploy the API Server (Web Service)

1. Render dashboard → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Root Directory** | `artifacts/api-server` |
| **Runtime** | Node |
| **Build Command** | `cd ../.. && pnpm install && pnpm --filter @workspace/api-server run build` |
| **Start Command** | `node --enable-source-maps ./dist/index.mjs` |
| **Instance Type** | Free (or Starter for always-on) |

4. Add these **Environment Variables**:

| Key | Value |
|---|---|
| `DATABASE_URL` | Internal connection string from Step 2 |
| `OPENAI_API_KEY` | Your OpenAI key |
| `SESSION_SECRET` | Any long random string |
| `CLERK_SECRET_KEY` | From your Clerk dashboard (Step 5) |
| `CLERK_PUBLISHABLE_KEY` | From your Clerk dashboard (Step 5) |
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render sets this automatically, but set it explicitly to be safe) |
| `STORAGE_BUCKET` | Your R2/S3 bucket name (Step 6) |
| `STORAGE_ENDPOINT` | Your R2/S3 endpoint URL (Step 6) |
| `STORAGE_ACCESS_KEY_ID` | Your R2/S3 access key (Step 6) |
| `STORAGE_SECRET_ACCESS_KEY` | Your R2/S3 secret key (Step 6) |

---

## Step 4 — Deploy the Nova Frontend (Static Site)

1. Render dashboard → **New** → **Static Site**
2. Connect the same GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| **Root Directory** | `artifacts/nova` |
| **Build Command** | `cd ../.. && pnpm install && pnpm --filter @workspace/nova run build` |
| **Publish Directory** | `dist/public` |

4. Add these **Environment Variables** (Render injects these at build time for Vite):

| Key | Value |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | From your Clerk dashboard (Step 5) |
| `VITE_API_BASE_URL` | The URL of your API Web Service from Step 3 |
| `BASE_PATH` | `/` |

5. Under **Redirects / Rewrites**, add a rewrite rule so that client-side routing works:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** Rewrite

---

## Step 5 — Set Up Your Own Clerk Account

Replit-managed Clerk is tied to Replit's infrastructure and cannot be ported directly. You need your own Clerk app.

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and create an account
2. Create a new application — name it `Nova` or `AI&U`
3. Enable the sign-in methods you want (Email/Password + Google)
4. For Google OAuth: in Clerk dashboard → **SSO Connections** → **Google** → follow the steps to create a Google OAuth app in Google Cloud Console and paste the credentials back into Clerk
5. In Clerk dashboard → **API Keys**, copy:
   - **Publishable Key** → use as `CLERK_PUBLISHABLE_KEY` and `VITE_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → use as `CLERK_SECRET_KEY`
6. In Clerk dashboard → **Domains**, add your Render frontend URL (e.g. `https://nova.onrender.com`) as an allowed origin

> **Note:** Your development Replit user accounts will not carry over — you'll need to sign up again in the new environment. This is expected; Clerk dev and prod instances have separate user stores.

---

## Step 6 — Migrate File Storage to Cloudflare R2 (or AWS S3)

Currently uploaded files are saved to `./uploads/` on disk. Render's filesystem is ephemeral — files disappear on redeploy. You need to swap to object storage.

### Cloudflare R2 (recommended — S3-compatible, generous free tier)

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **R2** → Create a bucket named `nova-uploads`
2. In R2 settings, create an **API Token** with read/write access to the bucket
3. Note your:
   - **Account ID** (in the R2 overview page URL)
   - **Access Key ID** and **Secret Access Key** (from the API token)
   - Endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

### Code change needed in `artifacts/api-server/src/routes/uploads.ts`

Replace the `multer` disk storage with S3-compatible storage using the `@aws-sdk/client-s3` package (works with R2):

```bash
pnpm --filter @workspace/api-server add @aws-sdk/client-s3 @aws-sdk/lib-storage multer-s3
```

Then update the multer config to use `multer-s3` pointing at R2 instead of `diskStorage`. The rest of the route logic stays the same.

The env vars to add (`STORAGE_BUCKET`, `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`) are already listed in Step 3.

---

## Step 7 — Run Database Migrations

After the API server deploys for the first time and `DATABASE_URL` is pointed at Render's Postgres, SSH into the Render service (or use Render's Shell tab) and run:

```bash
pnpm --filter @workspace/db run migrate
```

This creates all the tables (conversations, messages, projects, leads, decisions, todos, uploads). Then re-run the seed script if you want the demo projects pre-loaded.

---

## Step 8 — Point the API URL in the Frontend

In `artifacts/nova/src/lib/queryClient.ts` (or wherever the API base URL is set), make sure it reads from an environment variable rather than being hardcoded to a relative path. The Vite env var `VITE_API_BASE_URL` set in Step 4 should control this.

If the API client currently uses a relative URL like `/api/...`, add a fallback:

```ts
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
// Use `${API_BASE}/api/...` for all requests
```

---

## Checklist Before Going Live

- [ ] GitHub repo created and up to date
- [ ] Render PostgreSQL provisioned, `DATABASE_URL` copied
- [ ] API Web Service deployed and healthy (`/api/projects` returns 200)
- [ ] Clerk app created, keys copied into Render env vars
- [ ] Google OAuth configured in Clerk dashboard
- [ ] Render frontend URL added to Clerk allowed origins
- [ ] Nova Static Site deployed, sign-in page loads
- [ ] R2/S3 bucket created, upload storage swapped in code
- [ ] Database migrations run on Render Postgres
- [ ] File a test upload, send a test Nova message end-to-end

---

## Estimated Effort

| Task | Time |
|---|---|
| GitHub + Render setup | 30 min |
| Clerk account + Google OAuth | 1 hour |
| File storage swap (R2 + code) | 2–4 hours |
| Migrations + smoke testing | 30 min |
| **Total** | **~4–6 hours** |
