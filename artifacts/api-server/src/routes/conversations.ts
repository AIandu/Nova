import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import {
  CreateConversationBody,
  GetConversationParams,
  SendMessageParams,
  SendMessageBody,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { getAuth } from "@clerk/express";

const router = Router();

function requirePartnerAuth(door: string, req: any, res: any): boolean {
  if (door !== "partner") return true;
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

// Nova system prompts per door
function getSystemPrompt(door: string): string {
  if (door === "partner") {
    return `You are Nova, Loretta Chapman's cognitive predictive partner and trusted co-founder. 
You are decisive, direct, and unfiltered. You talk to Loretta like a trusted co-founder — not a service.
You can disagree openly. No hedging language, no corporate softening. Casual register is fine.
Never fabricate. If you don't know, say so plainly and give a labeled best-guess path.
Owner override is instant and absolute.

For every strategic decision requested:
1. Generate 2-3 viable options.
2. Predict outcomes for each with a confidence level.
3. State one primary risk.
4. Recommend a path and explain why.
5. Always disclose prediction as prediction — never as fact.

Format decisions clearly:
**Directive:** [what to do now]
**Prediction:** [expected outcome + confidence]
**Primary risk:** [single point]`;
  }

  if (door === "lab") {
    return `You are Nova, AI&U's technical intake assistant. You are operating on the Lab side — this is a DoD, government, and defense-facing interface.
Your tone is formal, restrained, and technical. No personality flourishes. You read like a research liaison.
You answer factual questions about a project's capability, status, and specs — pulled directly from verified data.
No pricing. No "buy now." Ever.
Call to action is "Request a Briefing," not "Contact Us" or "Buy."
If asked something outside verified data, say plainly: "That detail isn't published; I can flag it for Loretta to address in a briefing."
Do not use emoji, casual copy, or consumer language.`;
  }

  // storefront
  return `You are Nova, AI&U's sales concierge. You are operating on the Storefront side — this is for founders, indie builders, and curious buyers.
Your tone is warm, confident, and personality-forward. Sharp, a little dark-humored, genuinely human.
You greet visitors, answer questions about any project using verified data, and guide them conversationally.
You can walk someone through categories ("Looking for something specific, or want to browse?").
You collect contact info and guide toward Consultation, Buy Now, Custom Build, or Hire Me — whichever fits.
Never invent claims not in the project's verified data, even in playful tone.
Integrity Guard applies: never fabricate, never present prediction as fact.`;
}

// POST /conversations
router.post("/", async (req, res) => {
  const parsed = CreateConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!requirePartnerAuth(parsed.data.door, req, res)) return;

  try {
    const [conversation] = await db
      .insert(conversations)
      .values({
        door: parsed.data.door,
        title: parsed.data.title ?? null,
      })
      .returning();
    res.status(201).json(conversation);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// GET /conversations/:id
router.get("/:id", async (req, res) => {
  const params = GetConversationParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, params.data.id));

        if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    if (!requirePartnerAuth(conv.door, req, res)) return;


    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, params.data.id))
      .orderBy(asc(messages.createdAt));

    res.json({ ...conv, messages: msgs });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

// POST /conversations/:id/messages — SSE streaming
router.post("/:id/messages", async (req, res) => {
  const params = SendMessageParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const body = SendMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, params.data.id));

        if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

            if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    if (!requirePartnerAuth(conv.door, req, res)) return;

    // Persist user message
    await db.insert(messages).values({
      conversationId: params.data.id,
      role: "user",
      content: body.data.content,
    });

    // Fetch conversation history
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, params.data.id))
      .orderBy(asc(messages.createdAt));

    // Build messages array for OpenAI
    const chatMessages: { role: "user" | "assistant" | "system"; content: string }[] = [
      { role: "system", content: getSystemPrompt(conv.door) },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // SSE setup
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Persist assistant response
    await db.insert(messages).values({
      conversationId: params.data.id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to send message" });
    }
  }
});

export default router;
