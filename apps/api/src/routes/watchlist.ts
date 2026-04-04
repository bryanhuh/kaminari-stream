import { Router } from "express";
import { z } from "zod";
import {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  getWatchlistEntry,
} from "../services/watchlist";

const router = Router();

const addSchema = z.object({
  animeId: z.number().int().positive(),
  animeTitle: z.string().min(1),
  animeCover: z.string().nullable().optional(),
  format: z.string().nullable().optional(),
  episodes: z.number().int().nullable().optional(),
  score: z.number().int().nullable().optional(),
  status: z.string().nullable().optional(),
});

// GET /api/watchlist — all saved entries
router.get("/", (_req, res) => {
  const entries = getWatchlist();
  res.json({ data: entries });
});

// GET /api/watchlist/:animeId — check if anime is saved
router.get("/:animeId", (req, res, next) => {
  try {
    const animeId = z.coerce.number().int().positive().parse(req.params.animeId);
    const entry = getWatchlistEntry(animeId);
    res.json({ data: entry ?? null });
  } catch (err) {
    next(err);
  }
});

// POST /api/watchlist — add anime
router.post("/", (req, res, next) => {
  try {
    const input = addSchema.parse(req.body);
    addToWatchlist(input);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/watchlist/:animeId — remove anime
router.delete("/:animeId", (req, res, next) => {
  try {
    const animeId = z.coerce.number().int().positive().parse(req.params.animeId);
    removeFromWatchlist(animeId);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
