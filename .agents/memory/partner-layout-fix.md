---
name: Partner layout height fix
description: Correct height setup for full-viewport absolute-positioned partner space
---

The partner space uses `absolute` positioning for all interactive elements (chat feed, command bar, uploads, todo board). This requires the positioned ancestor to be exactly one viewport tall.

Working config:
- Layout outer div: `h-[100dvh]` (NOT min-h-[100dvh] — that allows growing beyond viewport)
- Layout main: `flex-1 min-h-0 relative` (NOT h-[100dvh] — that doubles the height inside flex)
- PartnerHome outer div: `h-full` (inherits from main's flex-1)

**Why:** min-h + flex-1 + h-[100dvh] on different nested elements causes the container to grow to 200dvh, making `bottom-8` land off-screen below the visible area.
**How to apply:** Any full-viewport immersive layout using absolute children needs this pattern. One explicit h-[100dvh] at the top, then flex-1 min-h-0 for children.
