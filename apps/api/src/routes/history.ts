import { Router } from "express";
import { z } from "zod";
import {
  upsertProgress,
  getHistory,
  getAnimeHistory,
  getContinueWatching,
} from "../services/history";

const router = Router();

const upsertSchema = z.object({
  animeId: z.number().int().positive(),
  episodeId: z.string().min(1),
  episodeNumber: z.number().int().min(0),
  progressSeconds: z.number().min(0),
  durationSeconds: z.number().min(0),
  animeTitle: z.string().min(1),
  animeCover: z.string().nullable().optional(),
});

// GET /api/history — all recent history
router.get("/", (_req, res) => {
  const entries = getHistory(30);
  res.json({ data: entries });
});

// GET /api/history/continue — entries suitable for "continue watching"
router.get("/continue", (_req, res) => {
  const entries = getContinueWatching(12);
  res.json({ data: entries });
});

// GET /api/history/:animeId — all episodes watched for an anime
router.get("/:animeId", (req, res, next) => {
  try {
    const animeId = z.coerce.number().int().positive().parse(req.params.animeId);
    const entries = getAnimeHistory(animeId);
    res.json({ data: entries });
  } catch (err) {
    next(err);
  }
});

// POST /api/history — upsert progress
router.post("/", (req, res, next) => {
  try {
    const input = upsertSchema.parse(req.body);
    upsertProgress(input);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
