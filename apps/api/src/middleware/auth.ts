import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface JwtPayload {
  userId: number;
  email: string;
  username: string;
}

// Augment Express Request to carry the decoded JWT payload
declare global {
  namespace Express {
    interface Request {
      userId: number;
      jwtPayload: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.userId = payload.userId;
    req.jwtPayload = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}
