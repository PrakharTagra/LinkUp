import { execSync } from "child_process";
import fs from "fs";

try {
  console.log("📦 Installing frontend dependencies...");
  execSync("npm --prefix frontend install", { stdio: "inherit" });

  console.log("🚀 Building frontend with Vite...");
  execSync("npm --prefix frontend run build", { stdio: "inherit" });

  console.log("📂 Copying assets to root dist/ directory...");
  fs.cpSync("frontend/dist", "dist", { recursive: true });

  console.log("✅ Build finished successfully! Assets available in both dist/ and frontend/dist/");
} catch (err) {
  console.error("❌ Build error:", err.message);
  process.exit(1);
}
