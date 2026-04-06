import { Router, type Request, type Response } from "express";
import {
  browseByGenre,
  browseNewReleases,
  browseTopAiring,
  browseMostPopular,
  getSchedule,
} from "../services/consumet";

const router = Router();

// GET /api/browse/genre/:genre?page=1
router.get("/genre/:genre", async (req: Request, res: Response) => {
  const genre = req.params.genre as string;
  const page = Number(req.query.page) || 1;
  try {
    const data = await browseByGenre(genre, page);
    res.json({ data });
  } catch (err) {
    console.error("browseByGenre failed:", err);
    res.status(502).json({ error: "Failed to fetch genre results" });
  }
});

// GET /api/browse/new-releases?page=1
router.get("/new-releases", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  try {
    const data = await browseNewReleases(page);
    res.json({ data });
  } catch (err) {
    console.error("browseNewReleases failed:", err);
    res.status(502).json({ error: "Failed to fetch new releases" });
  }
});

// GET /api/browse/ongoing?page=1
router.get("/ongoing", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  try {
    const data = await browseTopAiring(page);
    res.json({ data });
  } catch (err) {
    console.error("browseTopAiring failed:", err);
    res.status(502).json({ error: "Failed to fetch ongoing anime" });
  }
});

// GET /api/browse/updates?page=1
router.get("/updates", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  try {
    const data = await browseMostPopular(page);
    res.json({ data });
  } catch (err) {
    console.error("browseMostPopular failed:", err);
    res.status(502).json({ error: "Failed to fetch updates" });
  }
});

// GET /api/browse/schedule/:date  (date = YYYY-MM-DD)
router.get("/schedule/:date", async (req: Request, res: Response) => {
  const date = req.params.date as string;
  try {
    const data = await getSchedule(date);
    res.json({ data });
  } catch (err) {
    console.error("getSchedule failed:", err);
    res.status(502).json({ error: "Failed to fetch schedule" });
  }
});

export default router;
