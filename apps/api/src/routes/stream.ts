import { Router } from "express";
import { z } from "zod";
import { getStreamSources, getHianimeStreamSources, getAnimePaheStreamSources } from "../services/consumet";
import { getAnimeDetail } from "../services/anilist";

const router = Router();

const querySchema = z.object({
  episodeId: z.string().min(1),
  animeId: z.coerce.number().int().positive().optional(),
  ep: z.coerce.number().int().positive().optional(),
});

// GET /api/stream?episodeId=...&animeId=...&ep=...
router.get("/", async (req, res, next) => {
  try {
    const { episodeId, animeId, ep } = querySchema.parse(req.query);

    // Try primary provider (animekai)
    try {
      const streamData = await getStreamSources(episodeId);
      if (streamData.sources.length > 0) {
        res.json({ data: { ...streamData, provider: "animekai" } });
        return;
      }
    } catch {
      // Primary failed — attempt fallbacks below
    }

    // Fallbacks require the anime title + episode number
    if (!animeId || !ep) {
      res.status(404).json({ error: "No stream sources found" });
      return;
    }

    // Resolve title from AniList cache
    let title: string | null = null;
    try {
      const detail = await getAnimeDetail(animeId) as { Media?: { title?: { english?: string; romaji?: string } } };
      const t = detail?.Media?.title;
      title = t?.english ?? t?.romaji ?? null;
    } catch {
      // Ignore AniList lookup failure
    }

    if (!title) {
      res.status(404).json({ error: "No stream sources found" });
      return;
    }

    // Fallback 1: Hianime
    const hianime = await getHianimeStreamSources(title, ep);
    if (hianime && hianime.sources.length > 0) {
      res.json({ data: { ...hianime, provider: "hianime" } });
      return;
    }

    // Fallback 2: Animepahe
    const animepahe = await getAnimePaheStreamSources(title, ep);
    if (animepahe && animepahe.sources.length > 0) {
      res.json({ data: { ...animepahe, provider: "animepahe" } });
      return;
    }

    res.status(404).json({ error: "No stream sources found across all providers" });
  } catch (err) {
    next(err);
  }
});

export default router;
