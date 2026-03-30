import { Router } from "express";
import { z } from "zod";
import { resolveProviderAnimeId } from "../services/providerResolver";
import { getAnimeInfo, toEpisodes } from "../services/consumet";

const router = Router();

const paramsSchema = z.object({
  animeId: z.coerce.number().int().positive(),
});

const querySchema = z.object({
  title: z.string().min(1),
});

// GET /api/episodes/:animeId?title=...
router.get("/:animeId", async (req, res, next) => {
  try {
    const { animeId } = paramsSchema.parse(req.params);
    const { title } = querySchema.parse(req.query);

    const providerAnimeId = await resolveProviderAnimeId(animeId, title);
    if (!providerAnimeId) {
      res.status(404).json({ error: "Anime not found on provider" });
      return;
    }

    const info = await getAnimeInfo(providerAnimeId);
    const episodes = toEpisodes(info);

    res.json({ data: { providerAnimeId, episodes } });
  } catch (err) {
    next(err);
  }
});

export default router;
