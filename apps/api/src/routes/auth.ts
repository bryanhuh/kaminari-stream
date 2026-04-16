import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { registerUser, loginUser, getUserById } from "../services/auth";
import { getUserStats, getUserTopGenres, getUserHistoryChart } from "../services/users";
import { requireAuth } from "../middleware/auth";
import {
  getAniListAuthUrl,
  exchangeCodeForToken,
  getAniListUser,
  saveOAuthCredentials,
  getOAuthStatus,
  disconnectAniList,
} from "../services/anilistOauth";
import crypto from "crypto";

const router = Router();

const registerSchema = z.object({
  username: z.string().min(2).max(32).regex(/^\w+$/, "Username may only contain letters, numbers, and underscores."),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message ?? "Invalid input." });
    return;
  }

  const { username, email, password } = result.data;
  try {
    const { user, token } = await registerUser(username, email, password);
    res.status(201).json({ data: { user, token } });
  } catch (err: unknown) {
    // Unique constraint violation — username or email already taken
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique") || msg.includes("duplicate") || msg.includes("already exists")) {
      res.status(409).json({ error: "An account with that email or username already exists." });
    } else {
      res.status(500).json({ error: "Registration failed. Please try again." });
    }
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const { email, password } = result.data;
  try {
    const { user, token } = await loginUser(email, password);
    res.json({ data: { user, token } });
  } catch {
    res.status(401).json({ error: "Invalid email or password." });
  }
});

// GET /api/auth/me — returns current user from JWT
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const user = await getUserById(req.userId);
  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }
  res.json({ data: { user } });
});

// GET /api/auth/anilist — initiate AniList OAuth flow
router.get("/anilist", requireAuth, async (req: Request, res: Response) => {
  // Generate a state token to prevent CSRF
  const state = crypto.randomBytes(32).toString("hex");

  const authUrl = getAniListAuthUrl(state);
  res.json({ data: { authUrl, state } });
});

// GET /api/auth/anilist/callback — handle AniList OAuth callback
router.get("/anilist/callback", requireAuth, async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Missing authorization code." });
    return;
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    const anilistUser = await getAniListUser(tokenData.access_token);

    await saveOAuthCredentials(
      req.userId,
      anilistUser.id,
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_in
    );

    res.json({ data: { connected: true, anilistUser: anilistUser.name } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: `Failed to connect AniList: ${msg}` });
  }
});

// GET /api/auth/anilist/status — check if user has AniList connected
router.get("/anilist/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const status = await getOAuthStatus(req.userId);
    res.json({ data: { connected: !!status, ...status } });
  } catch (err: unknown) {
    res.status(500).json({ error: "Failed to check AniList status." });
  }
});

// GET /api/auth/stats — user activity stats
router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const stats = await getUserStats(req.userId);
    res.json({ data: stats });
  } catch {
    res.status(500).json({ error: "Failed to load stats." });
  }
});

// GET /api/auth/top-genres — user's top genres based on watch history
router.get("/top-genres", requireAuth, async (req: Request, res: Response) => {
  try {
    const genres = await getUserTopGenres(req.userId);
    res.json({ data: genres });
  } catch {
    res.status(500).json({ error: "Failed to load genres." });
  }
});

// GET /api/auth/history-chart — weekly episode counts for the past 8 weeks
router.get("/history-chart", requireAuth, async (req: Request, res: Response) => {
  try {
    const chart = await getUserHistoryChart(req.userId);
    res.json({ data: chart });
  } catch {
    res.status(500).json({ error: "Failed to load chart data." });
  }
});

// DELETE /api/auth/anilist — disconnect AniList account
router.delete("/anilist", requireAuth, async (req: Request, res: Response) => {
  try {
    await disconnectAniList(req.userId);
    res.json({ data: { disconnected: true } });
  } catch (err: unknown) {
    res.status(500).json({ error: "Failed to disconnect AniList." });
  }
});

export default router;
