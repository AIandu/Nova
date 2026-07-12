# Nova Partner Space — UI Structure (Private, Loretta only)

No visitors ever reach this. Optimized for daily live-in use.

---

## Layout

**Background:** Dark/black base. Persistent scrolling chat feed runs behind everything — infinite scroll, no message limit.

**Center of screen:** Input box — text entry, mic icon, upload icon, all attached to the same input bar.

**Fade behavior:** When the input box is active/focused, the background chat feed fades to 20–30% opacity so Loretta can focus on what she's typing without losing the sense that history is still there.

**Font/accent:** Pastel pink/yellow against the dark background — matches the "rose font, black background" direction from the original spec.

---

## Core Elements

### 1. Chat Feed (background layer)
- Full persistent history, scrollable, no cutoff.
- This is the literal record of every Partner Space conversation — feeds the Decisions Log.

### 2. Input Bar (center, foreground)
- Text field
- Mic button (voice-to-text, since Loretta uses this heavily)
- Upload button
- Send

### 3. Upload Folder (bottom left)
- Stores uploaded files
- Delete option per file
- Persistent, visible without opening a separate page

### 4. To-Do Board (expandable)
- Collapsed by default — sits like a closed folder/tab
- Expands on click, closes when not in use
- Three columns: **Approval Needed / Waiting / Completed**
- Checkbox per item to mark approved
- This is where Nova surfaces things she's completed in the Engine Room that need Loretta's sign-off before going live on Lab or Storefront

### 5. Integrated App Icons
- Small row or corner cluster: Ionos email, GitHub, Google Search
- Quick-launch or quick-status, not full embedded apps — just fast access

### 6. AI&U Banner
- Small, top left, consistent with the other two doors for brand continuity

---

## Interaction Model

- Loretta types or talks (mic) → Nova responds inline in the chat feed.
- Any decision-engine output (options/predictions/risk) renders in the feed, formatted per the Output Discipline Rule — no markdown clutter, clean directive/prediction/risk blocks.
- Anything Nova completes autonomously (Engine Room work) that needs Loretta's approval populates the To-Do Board's "Approval Needed" column rather than interrupting the chat feed.
- Approved items move to "Completed"; anything blocked on missing info sits in "Waiting."

---

## What This Screen Deliberately Doesn't Have

- No visitor-facing elements
- No pricing, no project cards, no sales language
- No persona-switching — this is always "familiar co-founder" Nova, never Lab-formal or Storefront-warm

---

## Suggested Build Order

1. Core layout: background feed + center input bar (mic + upload) + fade behavior
2. Upload folder (bottom left) with delete
3. To-Do Board (collapsed/expand, three columns, checkbox approval)
4. Integrated app icons (Ionos, GitHub, Google Search — quick links first, deeper integration later)
5. Decision Engine output formatting in the feed
6. Wire To-Do Board to Engine Room outputs so scans/fixes/valuations land here automatically for approval
