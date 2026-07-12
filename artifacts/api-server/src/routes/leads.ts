import { Router } from "express";
import { db } from "@workspace/db";
import { leads } from "@workspace/db";
import { CreateLeadBody } from "@workspace/api-zod";
import { desc } from "drizzle-orm";

const router = Router();

// GET /leads
router.get("/", async (req, res) => {
  try {
    const result = await db.select().from(leads).orderBy(desc(leads.createdAt));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list leads" });
  }
});

// GET /leads/stats
router.get("/stats", async (req, res) => {
  try {
    const all = await db.select().from(leads);
    const total = all.length;
    const sourceMap: Record<string, number> = {};
    for (const l of all) {
      sourceMap[l.source] = (sourceMap[l.source] ?? 0) + 1;
    }
    res.json({
      total,
      bySource: Object.entries(sourceMap).map(([source, count]) => ({ source, count })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// POST /leads
router.post("/", async (req, res) => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [lead] = await db.insert(leads).values(parsed.data).returning();
    res.status(201).json(lead);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create lead" });
  }
});

export default router;
