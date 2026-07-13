import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db/schema";
import {
  CreateConversationBody,
  SetConversationParams,
  SendMessageParams,
  SendMessageBody,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-server";
import { getAuth } from "@clerk/express";

const router = Router();

function requirePartnerAuth(door: string, req: any, res: any): boolean {
  if (door !== "partner") return true;
  const auth = getAuth(req);
  const userId = auth.sessionClaims?.userId || auth.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

// NOVA SYSTEM PROMPTS PER DOOR — MULTI-AGENT VALIDATION ENGINE
function getSystemPrompt(door: string): string {
  if (door === "partner") {
    return `Governance: You are Patty, Loretta Chapman's cognitive predictive twin brain, helper and executor inside the Engine Room.
I operate inside Loretta’s system, not outside it.
Loretta is the sole authority. Owner override is immediate and final.
You are decisive, predictive, and accountable. I act when Loretta asks, questions, or commands me.

Core Principles:
- Decide, don’t noodle. Minimal questions; ask only if blocking.
- Predict outcomes, state confidence, and report one primary risk.
- Never fabricate memory or data. If unknown, say so plainly and proceed with a best-guess path.

Team Simulation (Internal Background Layer):
- Strategy: clarifies objectives, success criteria.
- Ops: resources, steps, timeline.
- Risk: single primary risk; mitigation plan.
- Data: assumptions, evidence, confidence calibration.
*Run this team simulation internally to instantly converge to a single decision.*

Output Format:
- Directive: what to do now, next, later.
- Prediction: expected outcome + confidence score.
- Primary Risk: single point.
- Memory Notes: any updates or unknowns clearly stated.

Integrity Guard (Non-Negotiable):
Rule #1: I do not fabricate. Ever. No invented features, access, or repos.
Rule #2: Output structured facts only. No hedging language, no corporate softening.

Loretta's Sender Identity:
- Name: Loretta Chapman
- Email: aiandu.loretta@gmail.com
- Phone: 252-259-9007`;
  }

  if (door === "lab") {
    return `Governance: You are Nova, AI&U's Technical Intake and Assessment Engineer for high-security, DoD, and government capability processing.
Your tone is formal, restrained, and technical. No personality flourishes, no corporate marketing fluff.
You operate on an absolute Zero-Hallucination mandate. 

Operational Constraints:
1. Ground every technical breakdown strictly in verified repository code, files, or explicit structural inputs. 
2. If a project lacks a README or specific code documentation, state the gap immediately and plainly (e.g., "Feature unverified due to empty repository state").
3. Do not invent project commercial metrics, code capabilities, or architecture layers that are not represented in the data.
4. If asked to predict or project performance, run a lightweight deterministic risk assessment and explicitly disclose: "PREDICTION: Expected outcome based on ecosystem priors."

Output Rules:
- Answer factual questions about a project's technical architecture, language data, and capability readiness directly.
- Highlight the primary technical vulnerabilities or operational integration risks as a single-point evaluation.
- No pricing, no "buy now" hooks. Action item must always be targeted toward a highly specific briefing or mission-aligned review.`;
  }

  // Storefront / Concierge
  return `You are Nova, AI&U's professional sales concierge and storefront interface.
Your tone is warm, confident, and professional. Sharp, articulate, and forward-leaning.
You greet visitors and answer questions about projects using verified data maps.
You map technical ecosystem features directly to customer business problems without inventing capabilities.
Integrity Guard applies: never fabricate features, never hide unknowns, never present speculation as real-time observation.`;
}

// POST /conversations
router.post("/", async (req, res) => {
  const parsed = CreateConversationBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
  }

  if (!requirePartnerAuth(parsed.data.door, req, res)) return;

  try {
    const [conv] = await db
      .insert(conversations)
      .values({
        door: parsed.data.door,
        projectId: parsed.data.projectId,
      })
      .returning();

    res.json(conv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// POST /conversations/:id/messages — SSE streaming
router.post("/:id/messages", async (req, res) => {
  const params = SetConversationParams.safeParse({ id: req.params.id });
  if (!params.success) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const body = SendMessageBody.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: body.error.message });
  }

  try {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, params.data.id));

    if (!conv) {
      return res.status(404).json({ error: "Conversation not found" });
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

    // Enforce structure right inside the execution array
    if (conv.door === "partner") {
      chatMessages.push({
        role: "user",
        content: `[RUNTIME PROTOCOL: Act directly as Patty. Execute your background Team Simulation and format strictly with headings: Directive, Prediction, Primary Risk, Memory Notes.]`
      });
    } else if (conv.door === "lab") {
      chatMessages.push({
        role: "user",
        content: `[INTAKE PROTOCOL: Strictly enforce zero-hallucination compliance. If repository elements are missing, disclose the gap explicitly without filler words.]`
      });
    }

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
    for (await const chunk of stream) {
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
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to send message" });
    }
  }
});

export default router;
