import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  getWatchlistEntry,
} from "../services/watchlist";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

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
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entries = await getWatchlist(req.userId);
    res.json({ data: entries });
  } catch (err) {
    next(err);
  }
});

// GET /api/watchlist/:animeId — check if anime is saved
router.get("/:animeId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animeId = z.coerce.number().int().positive().parse(req.params.animeId);
    const entry = await getWatchlistEntry(req.userId, animeId);
    res.json({ data: entry ?? null });
  } catch (err) {
    next(err);
  }
});

// POST /api/watchlist — add anime
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = addSchema.parse(req.body);
    await addToWatchlist({ ...input, userId: req.userId });
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/watchlist/:animeId — remove anime
router.delete("/:animeId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animeId = z.coerce.number().int().positive().parse(req.params.animeId);
    await removeFromWatchlist(req.userId, animeId);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
