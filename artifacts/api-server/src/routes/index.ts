import { Router } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import leadsRouter from "./leads";
import conversationsRouter from "./conversations";
import decisionsRouter from "./decisions";
import todosRouter from "./todos";
import uploadsRouter from "./uploads";

const router = Router();

router.use("/healthz", healthRouter);
router.use("/projects", projectsRouter);
router.use("/leads", leadsRouter);
router.use("/conversations", conversationsRouter);
router.use("/decisions", decisionsRouter);
router.use("/todos", todosRouter);
router.use("/uploads", uploadsRouter);

export default router;
