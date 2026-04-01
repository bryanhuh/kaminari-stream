import { Router, type Request, type Response } from "express";
import {
  getTrending,
  getPopular,
  searchAnimeAnilist,
  getAnimeDetail,
} from "../services/anilist";
import { getRecentEpisodes, getSpotlight } from "../services/consumet";

const router = Router();

router.get("/trending", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 18;
  const data = await getTrending(page, perPage);
  res.json({ data });
});

router.get("/popular", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 12;
  const data = await getPopular(page, perPage);
  res.json({ data });
});

router.get("/spotlight", async (req: Request, res: Response) => {
  const items = await getSpotlight();

  const withAnilistIds = await Promise.all(
    items.map(async (anime) => {
      try {
        const result = await searchAnimeAnilist(anime.title, 1, 1);
        const media = result.Page.media[0] as { id: number } | undefined;
        return { ...anime, anilistId: media?.id ?? null };
      } catch {
        return { ...anime, anilistId: null };
      }
    })
  );

  res.json({ data: { results: withAnilistIds } });
});

router.get("/recent-episodes", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const recent = await getRecentEpisodes(page);

  // Resolve AniList IDs in parallel; failures produce null
  const withAnilistIds = await Promise.all(
    recent.results.map(async (ep) => {
      try {
        const result = await searchAnimeAnilist(ep.title, 1, 1);
        const media = result.Page.media[0] as { id: number } | undefined;
        return { ...ep, anilistId: media?.id ?? null };
      } catch {
        return { ...ep, anilistId: null };
      }
    })
  );

  res.json({
    data: {
      currentPage: recent.currentPage,
      hasNextPage: recent.hasNextPage,
      results: withAnilistIds,
    },
  });
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
  res.json({ data });
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid anime id" });
    return;
  }
  const data = await getAnimeDetail(id);
  res.json({ data });
});

export default router;
