import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/database.js";

// routes
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
import { FRONTEND_URL } from "./config/urls.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const app = express();

// middleware
const allowedOrigins = [FRONTEND_URL].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());


// DB
const startServer = async () => {
  try {
    await connectDB();
    
    // routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/posts", postRoutes);
    app.use("/api/courses", courseRoutes);
    app.use("/api/sessions", sessionRoutes);
    app.use("/api/messages", messageRoutes);
    app.use("/api/connections", connectionRoutes);
    app.use("/api/earnings", earningRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/skill-gap", skillGapRoutes);

    app.get("/api/health", (req, res) => {
      res.json({ status: "ok" });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Critical Failure: Could not start server due to DB connection error.");
    process.exit(1);
  }
};

startServer();