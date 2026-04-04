import { Router } from "express";
import episodesRouter from "./episodes";
import streamRouter from "./stream";
import historyRouter from "./history";
import animeRouter from "./anime";
import proxyRouter from "./proxy";
import browseRouter from "./browse";
import watchlistRouter from "./watchlist";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/anime", animeRouter);
router.use("/proxy", proxyRouter);
router.use("/episodes", episodesRouter);
router.use("/stream", streamRouter);
router.use("/history", historyRouter);
router.use("/browse", browseRouter);
router.use("/watchlist", watchlistRouter);

export default router;
