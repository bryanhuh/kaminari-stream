import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { registerUser, loginUser, getUserById } from "../services/auth";
import { requireAuth } from "../middleware/auth";

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

export default router;
