import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import axios from "axios";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

import connectDB from "./config/database.js";

// Routes
import authRoutes from "./routes/Auth.js";
import userRoutes from "./routes/User.js";
import postRoutes from "./routes/Post.js";
import courseRoutes from "./routes/Course.js";
import sessionRoutes from "./routes/Session.js";
import messageRoutes from "./routes/Message.js";
import connectionRoutes from "./routes/Connection.js";
import earningRoutes from "./routes/Earning.js";
import adminRoutes from "./routes/Admin.js";
import skillGapRoutes from "./routes/SkillGap.js";
import chatRoutes from "./routes/Chat.js";
import { FRONTEND_URL, SKILL_GAP_SERVICE_URL } from "./config/urls.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const app = express();
const START_TIME = Date.now();

// ── CORS Configuration ───────────────────────────────────────────────────────
const cleanOrigin = (url) => (url ? url.replace(/\/+$/, "").toLowerCase() : "");
const configuredFrontend = cleanOrigin(FRONTEND_URL);

app.use(cors({
  origin: function (origin, callback) {
    // If no origin (e.g. mobile apps, curl, server-to-server health checks)
    if (!origin) return callback(null, true);

    const normalized = cleanOrigin(origin);

    const isLocal =
      normalized.includes("localhost") ||
      normalized.includes("127.0.0.1");

    const isConfigured =
      configuredFrontend === "*" ||
      normalized === configuredFrontend;

    const isVercelOrRender =
      normalized.endsWith(".vercel.app") ||
      normalized.endsWith(".onrender.com");

    const extra = (process.env.ADDITIONAL_ALLOWED_ORIGINS || "")
      .split(",")
      .map(cleanOrigin)
      .filter(Boolean);
    const isExtra = extra.includes(normalized);

    if (isLocal || isConfigured || isVercelOrRender || isExtra) {
      return callback(null, origin);
    }

    // Default permissive fallback in production: reflect origin to avoid user lockouts
    return callback(null, origin);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));

// Gracefully rewrite duplicate /api/api prefixes if requested by older frontend builds
app.use((req, res, next) => {
  if (req.url.startsWith("/api/api/")) {
    req.url = req.url.replace(/^\/api\/api\//, "/api/");
  }
  next();
});

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));
app.use(cookieParser());

// ── Serverless / Request Database Connection Middleware ──────────────────────
app.use(async (req, res, next) => {
  // Only connect if not a pure lightweight health check
  if (req.path === "/" || req.path === "/health" || req.path === "/api/health") {
    return next();
  }
  try {
    await connectDB();
  } catch (err) {
    console.error("Database connection failure on request:", err.message);
  }
  next();
});

// ── Health & Keep-Alive Endpoints ───────────────────────────────────────────
const getHealthStatus = () => ({
  status: "ok",
  service: "linkup-backend",
  environment: process.env.VERCEL ? "vercel-serverless" : (process.env.NODE_ENV || "development"),
  uptime_seconds: Math.round((Date.now() - START_TIME) / 1000),
  timestamp: new Date().toISOString(),
  database: mongoose.connection.readyState === 1 ? "connected" : "connecting",
  memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
});

app.get("/", (req, res) => res.json(getHealthStatus()));
app.get("/api", (req, res) => res.json(getHealthStatus()));
app.get("/health", (req, res) => res.json(getHealthStatus()));
app.get("/api/health", (req, res) => res.json(getHealthStatus()));

// Keep-alive trigger that also pings the ML service on Render
app.get(["/keep-alive", "/api/keep-alive"], async (req, res) => {
  const mlTarget = (process.env.ML_SERVICE_URL || process.env.SKILL_GAP_SERVICE_URL || SKILL_GAP_SERVICE_URL).replace(/\/+$/, "") + "/health";
  let mlStatus = "unknown";
  try {
    const mlRes = await axios.get(mlTarget, { timeout: 8000, headers: { "User-Agent": "LinkUp-KeepAlive/1.0" } });
    mlStatus = mlRes.status === 200 ? "awake" : `status_${mlRes.status}`;
  } catch (e) {
    mlStatus = `unreachable: ${e.message}`;
  }
  return res.json({
    ...getHealthStatus(),
    ml_service: { target: mlTarget, status: mlStatus }
  });
});

// ── API Routes (Dual-mounted with and without /api prefix for bulletproof routing) ──
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/users", userRoutes);
app.use("/users", userRoutes);

app.use("/api/posts", postRoutes);
app.use("/posts", postRoutes);

app.use("/api/courses", courseRoutes);
app.use("/courses", courseRoutes);

app.use("/api/sessions", sessionRoutes);
app.use("/sessions", sessionRoutes);

app.use("/api/messages", messageRoutes);
app.use("/messages", messageRoutes);

app.use("/api/connections", connectionRoutes);
app.use("/connections", connectionRoutes);

app.use("/api/earnings", earningRoutes);
app.use("/earnings", earningRoutes);

app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);

app.use("/api/skill-gap", skillGapRoutes);
app.use("/skill-gap", skillGapRoutes);

// AI Chat Widget routes
app.use("/api/chat", chatRoutes);
app.use("/chat", chatRoutes);

// ── 404 Handler for API ─────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/auth") || req.path.startsWith("/users")) {
    return res.status(404).json({ message: `API route not found: ${req.method} ${req.path}` });
  }
  next();
});

// ── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ── Background Keep-Alive Worker (For persistent Node environments) ─────────
function setupKeepAlivePinger(port) {
  const selfUrl = process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL;
  const mlServiceUrl = process.env.ML_SERVICE_URL || process.env.SKILL_GAP_SERVICE_URL || SKILL_GAP_SERVICE_URL;
  const INTERVAL_MS = 10 * 60 * 1000;

  setTimeout(() => {
    setInterval(async () => {
      // 1. Ping self
      if (selfUrl && !selfUrl.includes("localhost")) {
        try {
          const target = selfUrl.replace(/\/+$/, "") + "/health";
          const res = await axios.get(target, { timeout: 15000, headers: { "User-Agent": "LinkUp-KeepAlive/1.0" } });
          console.log(`[Keep-Alive] Pinged backend self at ${target} (${res.status})`);
        } catch (err) {
          console.log(`[Keep-Alive] Backend self-ping notice: ${err.message}`);
        }
      }

      // 2. Ping ML service to keep it warm too!
      if (mlServiceUrl && !mlServiceUrl.includes("localhost") && !mlServiceUrl.includes("127.0.0.1")) {
        try {
          const target = mlServiceUrl.replace(/\/+$/, "") + "/health";
          const res = await axios.get(target, { timeout: 15000, headers: { "User-Agent": "LinkUp-KeepAlive/1.0" } });
          console.log(`[Keep-Alive] Pinged ML service at ${target} (${res.status})`);
        } catch (err) {
          console.log(`[Keep-Alive] ML service ping notice: ${err.message}`);
        }
      }
    }, INTERVAL_MS);
  }, 20000);
}

// ── Start Server for local / non-serverless environments ────────────────────
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 LinkUp Backend running on port ${PORT}`);
      setupKeepAlivePinger(PORT);
    });
  }).catch((err) => {
    console.error("Initial DB connection failed:", err.message);
    app.listen(PORT, () => {
      console.log(`🚀 LinkUp Backend running on port ${PORT} (listening despite DB init error)`);
      setupKeepAlivePinger(PORT);
    });
  });
}

export default app;
