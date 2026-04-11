import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import {
  upsertProgress,
  getHistory,
  getAnimeHistory,
  getContinueWatching,
  deleteHistoryEntry,
} from "../services/history";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

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
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entries = await getHistory(req.userId, 30);
    res.json({ data: entries });
  } catch (err) {
    next(err);
  }
});

// GET /api/history/continue — entries suitable for "continue watching"
router.get("/continue", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entries = await getContinueWatching(req.userId, 12);
    res.json({ data: entries });
  } catch (err) {
    next(err);
  }
});

// GET /api/history/:animeId — all episodes watched for an anime
router.get("/:animeId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animeId = z.coerce.number().int().positive().parse(req.params.animeId);
    const entries = await getAnimeHistory(req.userId, animeId);
    res.json({ data: entries });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/history/:id — remove a single history entry
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    await deleteHistoryEntry(req.userId, id);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

// POST /api/history — upsert progress
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = upsertSchema.parse(req.body);
    await upsertProgress({ ...input, userId: req.userId });
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
