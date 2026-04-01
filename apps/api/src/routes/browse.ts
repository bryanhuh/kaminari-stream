import { Router, type Request, type Response } from "express";
import {
  browseByGenre,
  browseNewReleases,
  browseTopAiring,
  browseMostPopular,
} from "../services/consumet";

const router = Router();

// GET /api/browse/genre/:genre?page=1
router.get("/genre/:genre", async (req: Request, res: Response) => {
  const genre = req.params.genre;
  const page = Number(req.query.page) || 1;
  const data = await browseByGenre(genre, page);
  res.json({ data });
});

// GET /api/browse/new-releases?page=1
router.get("/new-releases", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const data = await browseNewReleases(page);
  res.json({ data });
});

// GET /api/browse/ongoing?page=1
router.get("/ongoing", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const data = await browseTopAiring(page);
  res.json({ data });
});

// GET /api/browse/updates?page=1
router.get("/updates", async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const data = await browseMostPopular(page);
  res.json({ data });
});

export default router;
