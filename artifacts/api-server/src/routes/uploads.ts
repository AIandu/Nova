import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { uploads } from "@workspace/db";
import { DeleteUploadParams } from "@workspace/api-zod";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();
router.use(requireAuth);

// --- S3 / R2 client setup ---
// Required env vars: STORAGE_BUCKET, STORAGE_ENDPOINT,
// STORAGE_ACCESS_KEY_ID, STORAGE_SECRET_ACCESS_KEY
const s3Client = new S3Client({
  region: "auto", // R2 ignores region; set a real region if you swap to AWS S3 later
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.STORAGE_BUCKET!;

// --- Multer config using S3 storage instead of disk ---
const storage = multerS3({
  s3: s3Client,
  bucket: BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (_req, file, cb) => {
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
  const file = req.file as Express.MulterS3.File | undefined;

  if (!file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  try {
    const [upload] = await db
      .insert(uploads)
      .values({
        filename: file.key, // S3 object key — used for delete + retrieval
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
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

    // Delete the object from S3/R2 instead of local disk
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: upload.filename,
      })
    );

    await db.delete(uploads).where(eq(uploads.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete upload" });
  }
});

export default router;
