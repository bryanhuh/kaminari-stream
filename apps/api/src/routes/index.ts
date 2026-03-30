import { Router } from "express";
import episodesRouter from "./episodes";
import streamRouter from "./stream";
import historyRouter from "./history";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/episodes", episodesRouter);
router.use("/stream", streamRouter);
router.use("/history", historyRouter);

export default router;
