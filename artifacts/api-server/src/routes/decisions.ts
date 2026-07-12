import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { decisions } from "@workspace/db";
import {
  CreateDecisionBody,
  UpdateDecisionParams,
  UpdateDecisionBody,
} from "@workspace/api-zod";
import { desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();
router.use(requireAuth);

// GET /decisions
router.get("/", async (req, res) => {
  try {
    const result = await db.select().from(decisions).orderBy(desc(decisions.createdAt));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list decisions" });
  }
});

// POST /decisions
router.post("/", async (req, res) => {
  const parsed = CreateDecisionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [decision] = await db.insert(decisions).values(parsed.data).returning();
    res.status(201).json(decision);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create decision" });
  }
});

// PATCH /decisions/:id
router.patch("/:id", async (req, res) => {
  const params = UpdateDecisionParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const body = UpdateDecisionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const [decision] = await db
      .update(decisions)
      .set({ ...body.data, updatedAt: new Date() })
      .where(eq(decisions.id, params.data.id))
      .returning();

    if (!decision) {
      res.status(404).json({ error: "Decision not found" });
      return;
    }
    res.json(decision);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update decision" });
  }
});

export default router;
