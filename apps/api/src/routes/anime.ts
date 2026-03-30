import { Router, type Request, type Response } from "express";
import {
  getTrending,
  getPopular,
  searchAnimeAnilist,
  getAnimeDetail,
} from "../services/anilist";

const router = Router();

router.get("/trending", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 18;
  const data = await getTrending(page, perPage);
  res.json(data);
});

router.get("/popular", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 12;
  const data = await getPopular(page, perPage);
  res.json(data);
});

router.get("/search", async (req: Request, res: Response) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) {
    res.status(400).json({ error: "Missing query param: q" });
    return;
  }
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 30;
  const data = await searchAnimeAnilist(q, page, perPage);
  res.json(data);
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid anime id" });
    return;
  }
  const data = await getAnimeDetail(id);
  res.json(data);
});

export default router;
