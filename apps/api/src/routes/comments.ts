import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { getComments, addComment, deleteComment } from "../services/comments";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/comments?animeId=&episodeId= — public
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const animeId = z.coerce.number().int().positive().parse(req.query.animeId);
    const episodeId = z.string().min(1).parse(req.query.episodeId);
    const data = await getComments(animeId, episodeId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

// POST /api/comments — auth required
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = z
      .object({
        animeId: z.number().int().positive(),
        episodeId: z.string().min(1),
        body: z.string().min(1).max(1000),
      })
      .parse(req.body);
    const comment = await addComment({ ...input, userId: req.userId });
    // Attach the username from the JWT payload so the client gets a full object back
    res.status(201).json({
      data: { ...comment, username: req.jwtPayload.username },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/comments/:id — auth required, own comments only
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    await deleteComment(req.userId, id);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
