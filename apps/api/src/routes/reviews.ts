import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import {
  getReviews,
  getReviewStats,
  getUserReview,
  upsertReview,
  deleteReview,
} from "../services/reviews";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/reviews?animeId= — public: all reviews + stats
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animeId = z.coerce.number().int().positive().parse(req.query.animeId);
    const [list, stats] = await Promise.all([getReviews(animeId), getReviewStats(animeId)]);
    res.json({ data: { reviews: list, stats } });
  } catch (err) {
    next(err);
  }
});

// GET /api/reviews/mine?animeId= — auth: current user's review for an anime
router.get("/mine", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animeId = z.coerce.number().int().positive().parse(req.query.animeId);
    const entry = await getUserReview(req.userId, animeId);
    res.json({ data: entry ?? null });
  } catch (err) {
    next(err);
  }
});

const upsertSchema = z.object({
  animeId: z.number().int().positive(),
  rating: z.number().int().min(1).max(10),
  review: z.string().max(500).nullable().optional(),
});

// POST /api/reviews — auth: create or update own review
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = upsertSchema.parse(req.body);
    const row = await upsertReview({ ...input, userId: req.userId });
    res.status(201).json({ data: row });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/reviews/:animeId — auth: delete own review
router.delete("/:animeId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animeId = z.coerce.number().int().positive().parse(req.params.animeId);
    await deleteReview(req.userId, animeId);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
