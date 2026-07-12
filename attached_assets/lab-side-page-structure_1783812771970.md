# AI&U Lab — Page Structure (DoD / Defense / Government Side)

Domain suggestion: a distinct subdomain, e.g. `lab.aiandu.io` or `defense.aiandu.io` — never linked from the storefront, never appearing in the same nav.

---

## 1. Landing Page

**Header:** Small AI&U mark, top left. No tagline like "shop" or "store." Just the org name and, optionally, "Advanced Systems Group" or similar under it.

**Hero section:**
- One sentence describing the operation: what AI&U builds and for whom (defense, aerospace, public safety, emergency infrastructure).
- No hero image of a product — a restrained visual (schematic-style, orbital/technical imagery) fits better than lifestyle photography.
- Single CTA: **"View Systems"** — not "Shop" or "Browse."

**Credibility strip (optional but strong):** Founder line, relevant affiliations or contacts if Loretta wants to name-drop (e.g., referencing DoD contract intelligence work, if she's comfortable), or leave this off entirely if nothing's public yet.

No pricing, no product carousel, no chat bubble popping up immediately.

---

## 2. Systems Index (the project list)

Replaces "storefront grid" — reads as a technical index or dossier list.

**Layout:** Simple list or grid, categorized:
- Defense Systems
- Aerospace / Orbital
- Public Safety & Emergency Infrastructure
- Cognitive AI / Decision Systems

**Each entry shows:**
- Project name
- One-line capability summary
- Status tag: *Prototype / In Development / Deployed*
- "View Details" link

No price, no "add to cart," no star ratings, no testimonials-as-marketing.

---

## 3. Individual System Page

This is the core credibility surface — needs to read like a technical brief, not a product page.

**Structure:**
1. **Name + one-line function** (e.g., "O.S.N. — Real-time orbital object tracking and conjunction analysis")
2. **Overview** — 2–4 sentences, what it does, what problem it solves, plainly stated
3. **Capabilities** — bulleted, factual (e.g., "Tracks 128 objects via live TLE data from CelesTrak," "Conjunction analysis with configurable alert thresholds")
4. **Status** — Prototype / In Development / Deployed, with a one-line note on maturity
5. **Technical note** (optional) — architecture, data sources, stack, if Loretta wants to signal technical depth
6. **White Paper** — download button, PDF, if one exists for that project
7. **Request a Briefing** — the only CTA on the page

No "buy now," no price, no urgency language, no "limited availability."

---

## 4. Nova — Intake Assistant (Lab side)

Not a floating chat avatar with a friendly greeting. Presented as a subdued, clearly-labeled widget:

**Framing:** "Ask about this system" — text field, no avatar face, no casual greeting message. If a greeting is needed at all: *"I can answer questions about this system's capabilities and status. For deeper technical or contractual discussion, I'll connect you directly with Loretta Chapman."*

**Behavior:**
- Answers only from verified Engine Room data for that project.
- If asked something not in the data: states plainly it isn't published, offers to flag it for the briefing request.
- Never attempts to close a sale or push urgency.
- End of any substantive exchange: offers the "Request a Briefing" action, not a "buy" action.

---

## 5. Request a Briefing (intake form)

Replaces "contact us" / checkout flow.

**Fields:** Name, organization, role/title (optional), email, area of interest (dropdown matching categories), brief note field.

**Confirmation copy:** something like *"Thank you — Loretta Chapman will follow up directly."* No automated "cart confirmation" tone.

**Backend:** feeds the same lead/contact object structure as the storefront, but tagged `source: lab` so Loretta can tell at a glance which door a lead came through.

---

## 6. About / Founder Page (optional but recommended)

Short, factual bio — background, focus areas, the "governor and counselor" design philosophy if she wants to state it publicly, no personal brand/humor voice here. This is the one place a DoD evaluator might actually want more context on who's behind the systems, and it should read as substantive, not promotional.

---

## What Explicitly Does NOT Appear on Lab Side

- Pricing of any kind
- "Buy now," "Add to cart," "Purchase"
- Blind box / randomized project bundles
- Emoji, casual copy, playful headlines
- Storefront navigation or any link into the storefront
- Testimonials framed as marketing (case studies framed factually are fine)

---

## Suggested Build Order

1. Landing page + nav shell
2. Systems Index (can launch with 2–3 verified projects, e.g. O.S.N., and expand)
3. Individual System Page template
4. Request a Briefing form + lead capture wired to Engine Room/lead data object
5. Nova intake widget (can launch after step 1–4 are live; site works fine without it initially)
6. About/Founder page
