import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { todos } from "@workspace/db";
import {
  CreateTodoBody,
  UpdateTodoParams,
  UpdateTodoBody,
  DeleteTodoParams,
} from "@workspace/api-zod";
import { desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();
router.use(requireAuth);

// GET /todos
router.get("/", async (req, res) => {
  try {
    const result = await db.select().from(todos).orderBy(desc(todos.createdAt));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list todos" });
  }
});

// POST /todos
router.post("/", async (req, res) => {
  const parsed = CreateTodoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [todo] = await db.insert(todos).values(parsed.data).returning();
    res.status(201).json(todo);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// PATCH /todos/:id
router.patch("/:id", async (req, res) => {
  const params = UpdateTodoParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const body = UpdateTodoBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const [todo] = await db
      .update(todos)
      .set({ ...body.data, updatedAt: new Date() })
      .where(eq(todos.id, params.data.id))
      .returning();

    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }
    res.json(todo);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// DELETE /todos/:id
router.delete("/:id", async (req, res) => {
  const params = DeleteTodoParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    await db.delete(todos).where(eq(todos.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

export default router;
