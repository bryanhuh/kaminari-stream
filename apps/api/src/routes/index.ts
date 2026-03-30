import { Router } from "express";
import episodesRouter from "./episodes";
import streamRouter from "./stream";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/episodes", episodesRouter);
router.use("/stream", streamRouter);

export default router;
