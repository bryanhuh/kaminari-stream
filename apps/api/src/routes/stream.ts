import { Router } from "express";
import { z } from "zod";
import { getStreamSources } from "../services/consumet";

const router = Router();

const querySchema = z.object({
  episodeId: z.string().min(1),
});

// GET /api/stream?episodeId=...
router.get("/", async (req, res, next) => {
  try {
    const { episodeId } = querySchema.parse(req.query);
    const streamData = await getStreamSources(episodeId);

    if (!streamData.sources.length) {
      res.status(404).json({ error: "No stream sources found" });
      return;
    }

    res.json({ data: streamData });
  } catch (err) {
    next(err);
  }
});

export default router;
