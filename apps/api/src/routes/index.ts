import { Router } from "express";
import episodesRouter from "./episodes";
import streamRouter from "./stream";
import historyRouter from "./history";
import animeRouter from "./anime";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/anime", animeRouter);
router.use("/episodes", episodesRouter);
router.use("/stream", streamRouter);
router.use("/history", historyRouter);

export default router;
