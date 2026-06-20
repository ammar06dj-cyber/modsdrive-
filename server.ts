import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const key = crypto.randomBytes(32);
  const hashA = crypto.createHmac("sha256", key).update(a).digest();
  const hashB = crypto.createHmac("sha256", key).update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cloud Run ingress / reverse proxy trust setting
  app.set("trust proxy", 1);

  app.use(express.json());

  // Define admin authentication rate limiter: max 5 requests per 15 minutes per IP
  const adminAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { error: "Too many attempts. Try again later." },
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Define general rate limiter for all other routes: max 100 requests per 15 minutes per IP
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: "Too many requests. Please try again later." },
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Admin Auth POST endpoint
  app.post("/api/admin-auth", adminAuthLimiter, (req, res) => {
    const { password } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;

    if (!password) {
      res.status(400).json({ error: "Password is required" });
      return;
    }

    let adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      if (process.env.NODE_ENV !== "production") {
        adminPassword = "admin-secure-default-dev";
        console.warn("⚠️ ADMIN_PASSWORD is not set. Falling back to development default password: 'admin-secure-default-dev'");
      } else {
        console.error("🔴 Error: ADMIN_PASSWORD environment variable is NOT set in production!");
        res.status(500).json({ error: "Server misconfiguration: admin authentication is not configured." });
        return;
      }
    }

    const isMatch = safeCompare(password, adminPassword);

    // Apply random delay to prevent timing attacks (100ms - 300ms)
    const delay = Math.floor(Math.random() * 201) + 100;

    setTimeout(() => {
      if (isMatch) {
        res.status(200).json({ authenticated: true });
      } else {
        const timestamp = new Date().toISOString();
        console.warn(`[FAILED AUTH] [${timestamp}] Failed admin login attempt from IP: ${ip}`);
        res.status(401).json({ authenticated: false, error: "Invalid authentication credentials." });
      }
    }, delay);
  });

  // Apply general rate limit to all other routes
  app.use(generalLimiter);

  // Serve Vite application
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
