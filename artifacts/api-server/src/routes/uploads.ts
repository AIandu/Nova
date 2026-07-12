import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { uploads } from "@workspace/db";
import { DeleteUploadParams } from "@workspace/api-zod";
import { desc } from "drizzle-orm";
import path from "path";
import fs from "fs";
import multer from "multer";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();
router.use(requireAuth);

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// GET /uploads
router.get("/", async (req, res) => {
  try {
    const result = await db.select().from(uploads).orderBy(desc(uploads.createdAt));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list uploads" });
  }
});

// POST /uploads (multipart)
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  try {
    const [upload] = await db
      .insert(uploads)
      .values({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      })
      .returning();
    res.status(201).json(upload);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to save upload" });
  }
});

// DELETE /uploads/:id
router.delete("/:id", async (req, res) => {
  const params = DeleteUploadParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  try {
    const [upload] = await db
      .select()
      .from(uploads)
      .where(eq(uploads.id, params.data.id));

    if (!upload) {
      res.status(404).json({ error: "Upload not found" });
      return;
    }

    const filePath = path.join(uploadDir, upload.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.delete(uploads).where(eq(uploads.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete upload" });
  }
});

export default router;
