import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import {
  getUserLists,
  createList,
  deleteList,
  renameList,
  getListEntries,
  addToList,
  removeFromList,
} from "../services/customLists";

const router = Router();
router.use(requireAuth);

// GET /api/lists — all custom lists for the user
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lists = await getUserLists(req.userId);
    res.json({ data: lists });
  } catch (err) {
    next(err);
  }
});

// POST /api/lists — create a new list
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = z.object({ name: z.string().min(1).max(80) }).parse(req.body);
    const list = await createList(req.userId, name);
    if (!list) {
      res.status(409).json({ error: "A list with that name already exists" });
      return;
    }
    res.json({ data: list });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/lists/:listId — rename a list
router.patch("/:listId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listId = z.coerce.number().int().positive().parse(req.params.listId);
    const { name } = z.object({ name: z.string().min(1).max(80) }).parse(req.body);
    await renameList(req.userId, listId, name);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/lists/:listId — delete a list
router.delete("/:listId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listId = z.coerce.number().int().positive().parse(req.params.listId);
    await deleteList(req.userId, listId);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

// GET /api/lists/:listId/entries — get all anime in a list
router.get("/:listId/entries", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listId = z.coerce.number().int().positive().parse(req.params.listId);
    const entries = await getListEntries(req.userId, listId);
    if (entries === null) {
      res.status(404).json({ error: "List not found" });
      return;
    }
    res.json({ data: entries });
  } catch (err) {
    next(err);
  }
});

// POST /api/lists/:listId/entries — add anime to a list
router.post("/:listId/entries", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listId = z.coerce.number().int().positive().parse(req.params.listId);
    const { animeId, animeTitle, animeCover } = z.object({
      animeId: z.number().int().positive(),
      animeTitle: z.string().min(1),
      animeCover: z.string().nullable().optional(),
    }).parse(req.body);
    const ok = await addToList(req.userId, listId, animeId, animeTitle, animeCover);
    if (!ok) {
      res.status(404).json({ error: "List not found" });
      return;
    }
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/lists/:listId/entries/:animeId — remove anime from a list
router.delete("/:listId/entries/:animeId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listId = z.coerce.number().int().positive().parse(req.params.listId);
    const animeId = z.coerce.number().int().positive().parse(req.params.animeId);
    await removeFromList(req.userId, listId, animeId);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
