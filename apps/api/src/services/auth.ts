import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users } from "../db/schema";
import { config } from "../config";
import type { JwtPayload } from "../middleware/auth";

const BCRYPT_ROUNDS = 12;
const TOKEN_EXPIRY = "7d";

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: TOKEN_EXPIRY });
}

export async function registerUser(username: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const inserted = await db
    .insert(users)
    .values({ username, email, passwordHash })
    .returning({ id: users.id, username: users.username, email: users.email });

  const user = inserted[0];
  const token = signToken({ userId: user.id, email: user.email, username: user.username });
  return { user, token };
}

export async function loginUser(email: string, password: string) {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid email or password.");
  }

  const token = signToken({ userId: user.id, email: user.email, username: user.username });
  return {
    user: { id: user.id, username: user.username, email: user.email },
    token,
  };
}

export async function getUserById(id: number) {
  const rows = await db
    .select({ id: users.id, username: users.username, email: users.email })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return rows[0] ?? null;
}
