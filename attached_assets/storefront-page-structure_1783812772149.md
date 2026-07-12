# AI&U Storefront — Page Structure (Founders / Indie / Curious Buyers)

Separate URL from Lab side, e.g. `aiandu.io` or `store.aiandu.io`. No link into the Lab side from here — keep the audiences from crossing paths accidentally.

---

## 1. Landing Page

**Header:** AI&U banner, small, top left (as spec'd). Nav to categories.

**Hero section:**
- Bold, personality-forward headline — this is where your voice can show. Confident, a little sharp.
- Visual: futuristic/premium theme, not sterile.
- Primary CTA: **"Browse Projects"**
- Secondary CTA: **"Chat with Nova"** — surfaces the concierge immediately here, unlike Lab side.

---

## 2. Category Navigation

- Defense-adjacent / Systems (can mirror Lab projects at a lighter tone, if Loretta wants crossover visibility)
- Personal Improvement / Safety
- Experimental / AI&U Labs (blind box lives here)
- Everything else / Featured

---

## 3. Project Grid (per category)

**Each card:**
- Image or short video
- Project name + one-line hook
- Price or "value" indicator
- Quick "Consultation" and "Buy Now" buttons

---

## 4. Individual Project Page

1. Name + hook
2. Image/video
3. Full description — what it is, what it does
4. Value/price
5. **Consultation / More Info** button
6. **Buy Now** button
7. **Download White Paper** (if available)
8. **Hire Me** button — for custom work tied to this project's domain

---

## 5. Nova — Sales Concierge (Storefront side)

Full personality-forward chat widget, front and center.

**Behavior:**
- Greets visitors, answers questions on any project using verified Engine Room data.
- Can walk someone through categories conversationally ("Looking for something specific, or want to browse?").
- Collects name, email, and consent to be contacted.
- Guides toward Consultation, Buy Now, Custom Build, or Hire Me — whichever fits the conversation.
- Never invents claims not in the project's verified data, even in playful tone.

---

## 6. Repo Blind Box

Its own section/page — separate from serious categories.

- "3 random projects, one price" mechanic
- Playful copy, impulse-buy framing
- Clearly its own corner of the site — doesn't bleed into Defense-adjacent category styling

---

## 7. Custom Build Request

Button/box: "Have an idea? Request a custom build."
- Short form: what they want, budget range (optional), timeline
- Routes to Loretta as a lead, tagged `source: custom-request`

---

## 8. Hire Me

Standalone page or modal:
- What kind of work Loretta takes on
- Contact form or direct booking link
- Tagged `source: hire-me` in lead data

---

## Lead Data Tagging (ties back to Nova's memory layer)

Every capture point across the storefront tags its source so Loretta can see at a glance where a lead came from:
`source: consultation | buy-now | blind-box | custom-request | hire-me | nova-chat`

---

## Suggested Build Order

1. Landing page + nav + category shell
2. Project grid + individual project page template (launch with 3–5 real projects)
3. Nova concierge chat (core selling tool — higher priority here than on Lab side)
4. Consultation + Buy Now + lead capture wired to data object
5. Custom Build Request + Hire Me pages
6. Repo Blind Box (last — fun feature, not core revenue path yet)
