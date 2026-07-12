---
name: OpenAI client env override
description: All three OpenAI client files must fall back to OPENAI_API_KEY (not AI_INTEGRATIONS_* vars)
---

The integrations-openai-ai-server template has THREE client files that each check for AI_INTEGRATIONS_OPENAI_BASE_URL and AI_INTEGRATIONS_OPENAI_API_KEY:
- lib/integrations-openai-ai-server/src/client.ts
- lib/integrations-openai-ai-server/src/image/client.ts
- lib/integrations-openai-ai-server/src/audio/client.ts

All three were patched to fall back to OPENAI_API_KEY when the AI_INTEGRATIONS vars are absent.

**Why:** Loretta has her own OPENAI_API_KEY and declined Replit AI Integrations. The template assumes the integration proxy is set up.
**How to apply:** On any new copy of this template, patch all three files. Pattern: `const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY`.
