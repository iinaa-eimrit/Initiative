import { Router, type IRouter } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

function signToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

function sanitizeUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    skills: user.skills,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, skills, bio } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db.insert(usersTable).values({
      name,
      email,
      passwordHash,
      role: role || "changemaker",
      skills: skills || null,
      bio: bio || null,
    }).returning();

    const token = signToken(user.id);
    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (err) {
    logger.error({ err }, "Signup failed");
    res.status(500).json({ error: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken(user.id);
    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    logger.error({ err }, "Login failed");
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const token = authHeader.slice(7);
    let payload: { userId: number };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    res.json(sanitizeUser(user));
  } catch (err) {
    logger.error({ err }, "Auth check failed");
    res.status(500).json({ error: "Auth check failed" });
  }
});

export default router;
