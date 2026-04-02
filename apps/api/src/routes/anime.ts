import { Router, type Request, type Response } from "express";
import {
  getTrending,
  getPopular,
  searchAnimeAnilist,
  getAnimeDetail,
  browseAZ,
} from "../services/anilist";
import { getRecentEpisodes, getSpotlight } from "../services/consumet";

const router = Router();

// Run `items` through `fn` with at most `concurrency` in-flight at a time
async function mapWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = await Promise.all(items.slice(i, i + concurrency).map(fn));
    results.push(...batch);
  }
  return results;
}

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

  const withAnilistIds = await mapWithConcurrency(
    items,
    async (anime) => {
      try {
        const result = await searchAnimeAnilist(anime.title, 1, 1);
        const media = result.Page.media[0] as { id: number } | undefined;
        return { ...anime, anilistId: media?.id ?? null };
      } catch {
        return { ...anime, anilistId: null };
      }
    },
    3
  );

  res.json({ data: { results: withAnilistIds } });
});

router.get("/recent-episodes", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const recent = await getRecentEpisodes(page);

  // Resolve AniList IDs in batches of 3 to avoid rate limiting
  const withAnilistIds = await mapWithConcurrency(
    recent.results,
    async (ep) => {
      try {
        const result = await searchAnimeAnilist(ep.title, 1, 1);
        const media = result.Page.media[0] as { id: number } | undefined;
        return { ...ep, anilistId: media?.id ?? null };
      } catch {
        return { ...ep, anilistId: null };
      }
    },
    3
  );

  res.json({
    data: {
      currentPage: recent.currentPage,
      hasNextPage: recent.hasNextPage,
      results: withAnilistIds,
    },
  });
});

// GET /api/anime/az?letter=A&page=1
router.get("/az", async (req: Request, res: Response) => {
  const letter = String(req.query.letter ?? "A").trim().charAt(0).toUpperCase();
  const page = Number(req.query.page) || 1;
  const result = await browseAZ(letter, page, 30);
  // Filter to titles actually starting with the requested letter
  const filtered = (result.Page.media as { title: { romaji: string | null; english: string | null } }[]).filter(
    (m) => {
      const t = (m.title.english ?? m.title.romaji ?? "").trim().toUpperCase();
      return t.startsWith(letter);
    }
  );
  res.json({
    data: {
      letter,
      page,
      hasNextPage: result.Page.pageInfo.hasNextPage,
      media: filtered,
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
  try {
    const data = await getAnimeDetail(id);
    res.json({ data });
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 429) {
      res.status(429).json({ error: "Rate limited by AniList. Please try again shortly." });
    } else {
      res.status(500).json({ error: "Failed to fetch anime detail" });
    }
  }
});

export default router;
