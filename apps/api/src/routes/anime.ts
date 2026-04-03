import { Router, type Request, type Response } from "express";
import {
  getTrending,
  getPopular,
  searchAnimeAnilist,
  getAnimeDetail,
  browseAZ,
  getSeasonAnime,
  getNextSeasonAnime,
  getByGenre,
  getTVShows,
  getMovies,
  getRandomAnime,
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

function anilistErrorStatus(err: unknown): number {
  return (err as { response?: { status?: number } })?.response?.status ?? 500;
}

function handleAnilistError(err: unknown, res: Response) {
  const status = anilistErrorStatus(err);
  if (status === 429) {
    res.status(429).json({ error: "Rate limited by AniList. Please try again shortly." });
  } else {
    res.status(500).json({ error: "Failed to fetch data from AniList." });
  }
}

router.get("/trending", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 18;
  try {
    const data = await getTrending(page, perPage);
    res.json({ data });
  } catch (err) {
    handleAnilistError(err, res);
  }
});

router.get("/popular", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 12;
  try {
    const data = await getPopular(page, perPage);
    res.json({ data });
  } catch (err) {
    handleAnilistError(err, res);
  }
});

router.get("/spotlight", async (req: Request, res: Response) => {
  try {
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
  } catch (err) {
    handleAnilistError(err, res);
  }
});

router.get("/recent-episodes", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  try {
    const recent = await getRecentEpisodes(page);

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
  } catch (err) {
    handleAnilistError(err, res);
  }
});

router.get("/season", async (_req: Request, res: Response) => {
  try {
    const data = await getSeasonAnime(18);
    res.json({ data });
  } catch (err) {
    handleAnilistError(err, res);
  }
});

router.get("/az", async (req: Request, res: Response) => {
  const letter = String(req.query.letter ?? "A").trim().charAt(0).toUpperCase();
  const page = Number(req.query.page) || 1;
  try {
    const result = await browseAZ(letter, page, 30);
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
  } catch (err) {
    handleAnilistError(err, res);
  }
});

router.get("/search", async (req: Request, res: Response) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) {
    res.status(400).json({ error: "Missing query param: q" });
    return;
  }
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 30;
  try {
    const data = await searchAnimeAnilist(q, page, perPage);
    res.json({ data });
  } catch (err) {
    handleAnilistError(err, res);
  }
});

router.get("/shows", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 24;
  const genre = req.query.genre ? String(req.query.genre) : undefined;
  try {
    const data = await getTVShows(page, perPage, genre);
    res.json({ data });
  } catch (err) {
    handleAnilistError(err, res);
  }
});

router.get("/movies", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const perPage = Number(req.query.perPage) || 24;
  const genre = req.query.genre ? String(req.query.genre) : undefined;
  try {
    const data = await getMovies(page, perPage, genre);
    res.json({ data });
  } catch (err) {
    handleAnilistError(err, res);
  }
});

router.get("/random", async (_req: Request, res: Response) => {
  try {
    const anime = await getRandomAnime();
    res.json({ data: anime });
  } catch (err) {
    handleAnilistError(err, res);
  }
});

router.get("/next-season", async (_req: Request, res: Response) => {
  try {
    const data = await getNextSeasonAnime(12);
    res.json({ data });
  } catch (err) {
    handleAnilistError(err, res);
  }
});

router.get("/recommendations", async (req: Request, res: Response) => {
  const genre = String(req.query.genre ?? "").trim();
  if (!genre) {
    res.status(400).json({ error: "Missing query param: genre" });
    return;
  }
  try {
    const data = await getByGenre(genre, 6);
    res.json({ data });
  } catch (err) {
    handleAnilistError(err, res);
  }
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
  } catch (err) {
    handleAnilistError(err, res);
  }
});

export default router;
