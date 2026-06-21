import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import pino from "pino";
import pinoHttp from "pino-http";
import helmet from "helmet";
import { createClient } from "@supabase/supabase-js";

const logger = pino({
  level: "info",
});

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const key = crypto.randomBytes(32);
  const hashA = crypto.createHmac("sha256", key).update(a).digest();
  const hashB = crypto.createHmac("sha256", key).update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function getClientIp(req: express.Request): string | null {
  // 1. Try X-Forwarded-For (can be comma-separated list of IPs set by reverse proxy/load balancer)
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    const ips = typeof xForwardedFor === "string"
      ? xForwardedFor.split(",")
      : Array.isArray(xForwardedFor)
        ? xForwardedFor
        : [];
    const clientIp = ips[0]?.trim();
    if (clientIp) return clientIp;
  }

  // 2. Try X-Real-IP
  const xRealIp = req.headers["x-real-ip"];
  if (typeof xRealIp === "string" && xRealIp.trim()) {
    return xRealIp.trim();
  }

  // 3. Try standard remoteAddress from socket
  const remoteAddress = req.socket?.remoteAddress;
  if (typeof remoteAddress === "string" && remoteAddress.trim()) {
    return remoteAddress.trim();
  }

  // 4. Try standard Express request.ip property
  if (typeof req.ip === "string" && req.ip.trim()) {
    return req.ip.trim();
  }

  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  const isProduction = process.env.NODE_ENV === "production";
  // ALLOW_IFRAME_PREVIEW is used to allow staging/preview/development environments to frame the application.
  // This is strictly disabled/falsy in real production environments to prevent clickjacking attacks on critical admin features.
  const allowIframePreview = process.env.ALLOW_IFRAME_PREVIEW === "true" || !isProduction;

  // Enable Helmet for enhanced security headers with dynamic CSP and Clickjacking protection
  app.use(helmet({
    contentSecurityPolicy: isProduction ? {
      directives: {
        defaultSrc: ["'self'"],
        // 'unsafe-inline' is included in script-src for single-page applications built with Vite/React
        scriptSrc: ["'self'", "'unsafe-inline'"],
        // 'unsafe-inline' is necessary for Tailwind CSS run-time styling injects
        styleSrc: ["'self'", "'unsafe-inline'"],
        // Allow loading secure HTTPS images (including Unsplash, Supabase storage, etc.) and data URIs
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        // Allow connecting to self (API routes) and Supabase endpoints
        connectSrc: [
          "'self'",
          "https://*.supabase.co",
          "wss://*.supabase.co"
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        // Clickjacking protection: Block all framing in production unless explicitly authorized for preview environments
        frameAncestors: allowIframePreview
          ? ["'self'", "https://ai.studio", "https://*.google.com", "https://*.run.app"]
          : ["'none'"],
      }
    } : false, // Disabled in development/staging to prevent blocking Vite's runtime scripts or hot reloading features
    // Clickjacking protection: Refuse all framing attempts in production,
    // only bypass during development or when staging iframe environment is explicitly authorized.
    frameguard: allowIframePreview ? false : { action: "deny" },
  }));

  // Cloud Run ingress / reverse proxy trust setting
  app.set("trust proxy", 1);

  // 1. Un-redirected and un-rate-limited health check endpoints prior to any routing / redirects
  app.get(["/healthz", "/api/health"], (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // HTTPS enforcement middleware in production
  if (process.env.NODE_ENV === "production" || process.env.HTTPS_REDIRECT === "true") {
    app.use((req, res, next) => {
      const userAgent = req.headers["user-agent"] || "";
      const host = req.headers.host || "";

      // Bypass HTTPS redirect for:
      // - Google Health Checker (Cloud Run startup/warmup/health probes)
      // - Kubernetes / container probes
      // - Direct local host probes (e.g. localhost, loopback, or private range ip)
      if (
        userAgent.includes("GoogleHC") ||
        userAgent.includes("kube-probe") ||
        host.includes("localhost") ||
        host.includes("127.0.0.1") ||
        host.startsWith("10.") ||
        host.startsWith("172.") ||
        host.startsWith("192.168.")
      ) {
        return next();
      }

      // Check trust proxy req.secure status or X-Forwarded-Proto header
      const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
      if (!isHttps) {
        const secureUrl = `https://${host}${req.url}`;
        logger.info({ url: req.url, secureUrl }, "Redirecting non-HTTPS request to secure HTTPS endpoint");
        return res.redirect(301, secureUrl);
      }
      next();
    });
  }

  // Pino-HTTP middleware for logging all requests
  app.use(pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => {
        const url = req.url || "";
        // Don't log development source files, hot-reloading assets, or dependencies to prevent console clutter
        return (
          url.startsWith("/@") ||
          url.startsWith("/src/") ||
          url.startsWith("/node_modules/") ||
          url.includes("hot-update") ||
          /\.(js|ts|tsx|css|png|jpg|jpeg|svg|webp|gif|ico|map)$/.test(url.split("?")[0])
        );
      },
    },
    customProps: (req) => ({
      ip: getClientIp(req as any) || "Unknown IP",
    }),
  }));

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

  // Password strength validation middleware to prevent memory exhaustion and timing issues
  const validateAdminPasswordPayload = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const { password } = req.body;

    if (!password || typeof password !== "string") {
      res.status(400).json({ error: "Password must be a non-empty string." });
      return;
    }

    // Prevent massive payloads to avoid memory issues (maximum 128 characters)
    // Ensures a minimum secure length of 8 characters
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: "Password length must be between 8 and 128 characters." });
      return;
    }

    // Secure non-backtracking regex checking to prevent ReDoS and validate standard characters
    const safePasswordPattern = /^[a-zA-Z0-9!@#$%^&*()_+=\-[\]{}|\\:;"'<>,.?/~`]{8,128}$/;
    if (!safePasswordPattern.test(password)) {
      res.status(400).json({ error: "Password contains invalid characters or doesn't match complexity requirements." });
      return;
    }

    next();
  };

  // Define general rate limiter for all other routes: max 100 requests per 15 minutes per IP
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: "Too many requests. Please try again later." },
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Secure clickjacking rate-limit protection for download counter: max 30 updates per 15 min per IP
  const downloadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 30,
    message: { error: "Too many download operations. Please try again later." },
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getClientIp(req as any) || req.ip || "Unknown IP",
  });

  // Session duration: 2 hours
  const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;
  const adminSessions = new Map<string, { expiresAt: number }>();

  function parseCookies(cookieHeader: string | undefined): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(";").forEach(cookie => {
      const parts = cookie.split("=");
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const value = parts.slice(1).join("=").trim();
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  }

  const requireAdminSession = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const xAdminTokenHeader = req.headers["x-admin-token"];
    let token: string | undefined = typeof xAdminTokenHeader === "string" ? xAdminTokenHeader : undefined;
    
    if (!token && req.headers.authorization) {
      const parts = (req.headers.authorization as string).split(" ");
      if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
        token = parts[1];
      }
    }

    if (!token) {
      const cookies = parseCookies(req.headers.cookie);
      token = cookies["admin_session"];
    }

    if (!token || typeof token !== "string") {
      res.status(401).json({ error: "Unauthorized: Admin session token is missing." });
      return;
    }

    const session = adminSessions.get(token);
    if (!session) {
      res.status(401).json({ error: "Unauthorized: Invalid or expired admin session." });
      return;
    }

    if (Date.now() > session.expiresAt) {
      adminSessions.delete(token);
      res.status(401).json({ error: "Unauthorized: Admin session has expired." });
      return;
    }

    session.expiresAt = Date.now() + SESSION_DURATION_MS;
    next();
  };

  const allowedCategories = [
    'cars', 'trucks', 'buses', 'boats', 'excavators', 'maps', 
    'motorcycles', 'news', 'others', 'planes', 'tractors', 'updates', 'trailers'
  ];

  function validateModPayload(payload: any) {
    if (!payload || typeof payload !== 'object') {
      return "Invalid payload format.";
    }

    const { name, description, category, image_url, download_url, game_version, mod_version, gallery_urls, file_size } = payload;

    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 150) {
      return "Name is required and must be 150 characters or less.";
    }

    if (!description || typeof description !== "string" || description.trim().length === 0 || description.length > 2000) {
      return "Description is required and must be 2000 characters or less.";
    }

    if (!category || typeof category !== "string" || !allowedCategories.includes(category)) {
      return `Category is invalid. Allowed options: ${allowedCategories.join(", ")}`;
    }

    if (!image_url || typeof image_url !== "string" || !image_url.startsWith("https://")) {
      return "Image URL is required and must be a secure HTTPS link.";
    }

    if (!download_url || typeof download_url !== "string" || !download_url.startsWith("https://")) {
      return "Download URL is required and must be a secure HTTPS link.";
    }

    if (gallery_urls !== undefined && gallery_urls !== null) {
      if (!Array.isArray(gallery_urls)) {
        return "Gallery URLs must be an array of strings.";
      }
      for (const url of gallery_urls) {
        if (typeof url !== "string" || !url.startsWith("https://")) {
          return "All gallery URLs must be secure HTTPS links.";
        }
      }
    }

    if (file_size !== undefined && file_size !== null) {
      if (typeof file_size !== "string" || file_size.length > 50) {
        return "File size must be a string up to 50 characters.";
      }
    }

    if (game_version !== undefined && game_version !== null) {
      if (typeof game_version !== "string" || game_version.length > 50) {
        return "Game version must be a string up to 50 characters.";
      }
    }

    if (mod_version !== undefined && mod_version !== null) {
      if (typeof mod_version !== "string" || mod_version.length > 50) {
        return "Mod version must be a string up to 50 characters.";
      }
    }

    return null;
  }

  // Import and initialize Supabase Client with service key or anon fallback
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  const serverSupabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

  // Admin Auth POST endpoint
  app.post("/api/admin-auth", adminAuthLimiter, validateAdminPasswordPayload, (req, res) => {
    const { password } = req.body;
    const ip = getClientIp(req) || "Unknown IP";

    if (!password) {
      res.status(400).json({ error: "Password is required" });
      return;
    }

    let adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      logger.error("Error: ADMIN_PASSWORD environment variable is NOT set! Control panel authentication is currently disabled.");
      res.status(500).json({ error: "Server misconfiguration: admin authentication is not configured." });
      return;
    }

    const isMatch = safeCompare(password, adminPassword);

    // Apply random delay to prevent timing attacks (100ms - 300ms)
    const delay = Math.floor(Math.random() * 201) + 100;

    setTimeout(() => {
      if (isMatch) {
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = Date.now() + SESSION_DURATION_MS;
        adminSessions.set(token, { expiresAt });

        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = [
          `admin_session=${token}`,
          "HttpOnly",
          "Path=/",
          "SameSite=Lax",
          `Max-Age=${2 * 60 * 60}`, // 2 hours
        ];
        if (isProduction) {
          cookieOptions.push("Secure");
        }
        res.setHeader("Set-Cookie", cookieOptions.join("; "));

        res.status(200).json({ authenticated: true, token });
      } else {
        const timestamp = new Date().toISOString();
        logger.warn({ ip, timestamp }, `Failed admin login attempt`);
        res.status(401).json({ authenticated: false, error: "Invalid authentication credentials." });
      }
    }, delay);
  });

  // Admin Log-Out endpoint
  app.post("/api/admin-logout", (req, res) => {
    const xAdminTokenHeader = req.headers["x-admin-token"];
    let token: string | undefined = typeof xAdminTokenHeader === "string" ? xAdminTokenHeader : undefined;
    if (!token && req.headers.authorization) {
      const parts = (req.headers.authorization as string).split(" ");
      if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
        token = parts[1];
      }
    }
    if (!token) {
      const cookies = parseCookies(req.headers.cookie);
      token = cookies["admin_session"];
    }

    if (token) {
      adminSessions.delete(token);
    }

    res.setHeader("Set-Cookie", "admin_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });

  // Dedicated rate limiter for administrative database actions
  const adminModsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: "Too many administrative requests. Please try again later." },
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
  });

  // POST /api/admin/mods - Add a new mod safely
  app.post("/api/admin/mods", adminModsLimiter, requireAdminSession, async (req, res) => {
    try {
      const validationError = validateModPayload(req.body);
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      if (!serverSupabase) {
        res.status(500).json({ error: "Database connection is not configured or offline." });
        return;
      }

      const { name, description, category, image_url, download_url, game_version, mod_version, gallery_urls, file_size } = req.body;

      const insertPayload: any = {
        name,
        description,
        category,
        image_url,
        download_url,
        downloads_count: 0,
      };

      if (game_version !== undefined) insertPayload.game_version = game_version;
      if (mod_version !== undefined) insertPayload.mod_version = mod_version;
      if (gallery_urls !== undefined) insertPayload.gallery_urls = gallery_urls;
      if (file_size !== undefined) insertPayload.file_size = file_size;

      const { data, error } = await serverSupabase
        .from('mods')
        .insert([insertPayload])
        .select()
        .single();

      if (error) {
        logger.error({ error: error.message }, "Error inserting mod into Supabase");
        res.status(500).json({ error: "Failed to persist new vehicle mod in secure database." });
        return;
      }

      res.status(201).json(data);
    } catch (err: any) {
      logger.error({ error: err.message }, "Server exception in POST /api/admin/mods");
      res.status(500).json({ error: "An unexpected server error occurred." });
    }
  });

  // DELETE /api/admin/mods/:id - Delete an existing mod safely
  app.delete("/api/admin/mods/:id", adminModsLimiter, requireAdminSession, async (req, res) => {
    try {
      const idStr = req.params.id;
      const id = parseInt(idStr, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid mod ID format." });
        return;
      }

      if (!serverSupabase) {
        res.status(500).json({ error: "Database connection is not configured or offline." });
        return;
      }

      const { error } = await serverSupabase
        .from('mods')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error({ error: error.message, id }, "Error deleting mod from Supabase");
        res.status(500).json({ error: "Failed to remove the requested mod from secure database." });
        return;
      }

      res.status(200).json({ success: true });
    } catch (err: any) {
      logger.error({ error: err.message }, "Server exception in DELETE /api/admin/mods/:id");
      res.status(500).json({ error: "An unexpected server error occurred." });
    }
  });

  // POST /api/mods/:id/download - Safely increment a mod download count with rate limiting and verification
  app.post("/api/mods/:id/download", downloadLimiter, async (req, res) => {
    try {
      const idStr = req.params.id;
      const id = parseInt(idStr, 10);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ error: "Invalid mod ID format." });
        return;
      }

      if (!serverSupabase) {
        res.status(500).json({ error: "Database connection is not configured or offline." });
        return;
      }

      // First query the mod using service_role to verify existence and approval status
      const { data: mod, error: fetchError } = await serverSupabase
        .from('mods')
        .select('id, status, downloads_count')
        .eq('id', id)
        .single();

      if (fetchError || !mod) {
        logger.warn({ id, fetchError }, "Failed to fetch mod for download increment");
        res.status(404).json({ error: "Mod not found." });
        return;
      }

      // Ensure mod status is approved or is null/undefined to count as approved
      const isApproved = mod.status === 'approved' || mod.status === undefined || mod.status === null;
      if (!isApproved) {
        logger.warn({ id, status: mod.status }, "Attempted to download an unapproved mod");
        res.status(403).json({ error: "Access to this mod is denied or pending review." });
        return;
      }

      // Perform secure backend RPC incrementing downloads
      const { data: newCount, error: rpcError } = await serverSupabase
        .rpc('increment_downloads', { mod_id: id });

      if (rpcError) {
        logger.error({ rpcError, id }, "Error calling increment_downloads via Supabase RPC");
        
        // Secondary fallback update just in case RPC does not exist or fails
        const currentDownloads = mod.downloads_count || 0;
        const { data: updatedMod, error: updateError } = await serverSupabase
          .from('mods')
          .update({ downloads_count: currentDownloads + 1 })
          .eq('id', id)
          .select('downloads_count')
          .single();

        if (updateError) {
          logger.error({ updateError, id }, "Fallback downloads_count update failed");
          res.status(500).json({ error: "Failed to securely update download count." });
          return;
        }

        res.status(200).json({ id: mod.id, downloads_count: updatedMod.downloads_count });
        return;
      }

      res.status(200).json({ id: mod.id, downloads_count: newCount || (mod.downloads_count + 1) });
    } catch (err: any) {
      logger.error({ error: err.message }, "Server exception in POST /api/mods/:id/download");
      res.status(500).json({ error: "An unexpected server error occurred." });
    }
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
