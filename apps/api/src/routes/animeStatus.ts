import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import {
  setAnimeStatus,
  removeAnimeStatus,
  getAnimeStatus,
  getAllAnimeStatuses,
} from "../services/animeStatus";
import { syncAnimeStatusToAniList } from "../services/anilistOauth";

const router = Router();
router.use(requireAuth);

const STATUS_VALUES = ["WATCHING", "COMPLETED", "DROPPED", "PLAN_TO_WATCH"] as const;

const setSchema = z.object({
  animeTitle: z.string().min(1),
  animeCover: z.string().nullable().optional(),
  status: z.enum(STATUS_VALUES),
});

// GET /api/status — all statuses for the logged-in user
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entries = await getAllAnimeStatuses(req.userId);
    res.json({ data: entries });
  } catch (err) {
    next(err);
  }
});

// GET /api/status/:animeId — single entry (null if not set)
router.get("/:animeId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animeId = z.coerce.number().int().positive().parse(req.params.animeId);
    const entry = await getAnimeStatus(req.userId, animeId);
    res.json({ data: entry ?? null });
  } catch (err) {
    next(err);
  }
});

// POST /api/status/:animeId — upsert status
router.post("/:animeId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animeId = z.coerce.number().int().positive().parse(req.params.animeId);
    const body = setSchema.parse(req.body);
    await setAnimeStatus({ ...body, animeId, userId: req.userId });

    // Sync to AniList if connected (fire and forget)
    syncAnimeStatusToAniList(req.userId, animeId, body.status).catch((err) =>
      console.error("Failed to sync anime status to AniList:", err)
    );

    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/status/:animeId — remove status
router.delete("/:animeId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animeId = z.coerce.number().int().positive().parse(req.params.animeId);
    await removeAnimeStatus(req.userId, animeId);

    // Sync to AniList if connected (fire and forget)
    // Note: We don't have a direct "remove" mutation, so we just log it
    // Users can remove the entry from AniList directly if needed
    console.log(`User ${req.userId} removed anime ${animeId} locally`);

    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
