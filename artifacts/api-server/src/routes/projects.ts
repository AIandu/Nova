import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { projects } from "@workspace/db";
import {
  CreateProjectBody,
  ListProjectsQueryParams,
  GetProjectParams,
  UpdateProjectParams,
  UpdateProjectBody,
} from "@workspace/api-zod";

const router = Router();

// GET /projects
router.get("/", async (req, res) => {
  try {
    const query = ListProjectsQueryParams.safeParse(req.query);
    let result = await db.select().from(projects).orderBy(projects.createdAt);

    if (query.success) {
      if (query.data.category) {
        result = result.filter((p) => p.category === query.data.category);
      }
      if (query.data.status) {
        result = result.filter((p) => p.status === query.data.status);
      }
    }

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list projects" });
  }
});

// GET /projects/summary
router.get("/summary", async (req, res) => {
  try {
    const all = await db.select().from(projects);
    const total = all.length;

    const catMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {};
    for (const p of all) {
      catMap[p.category] = (catMap[p.category] ?? 0) + 1;
      statusMap[p.status] = (statusMap[p.status] ?? 0) + 1;
    }

    res.json({
      total,
      byCategory: Object.entries(catMap).map(([category, count]) => ({ category, count })),
      byStatus: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get summary" });
  }
});

// POST /projects
router.post("/", async (req, res) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [project] = await db
      .insert(projects)
      .values({
        ...parsed.data,
        capabilities: parsed.data.capabilities ?? [],
      })
      .returning();
    res.status(201).json(project);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// GET /projects/:id
router.get("/:id", async (req, res) => {
  const params = GetProjectParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, params.data.id));

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(project);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get project" });
  }
});

// PATCH /projects/:id
router.patch("/:id", async (req, res) => {
  const params = UpdateProjectParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const body = UpdateProjectBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const [project] = await db
      .update(projects)
      .set({ ...body.data, updatedAt: new Date() })
      .where(eq(projects.id, params.data.id))
      .returning();

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(project);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

export default router;
