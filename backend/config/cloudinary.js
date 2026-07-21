import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend .env explicitly here so config files imported before index.js
// still receive the correct values on Windows and in nodemon restarts.
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
  override: true,
});

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Cloudinary env is missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in backend/.env"
  );
}

// 🔹 Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// 🔹 Upload Image/Video Function (supports base64 data URIs)
export const uploadImage = async (file, folder = "connect_platform") => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",   // handles images AND videos
      chunk_size: 6000000,      // 6MB chunks for large files
      timeout: 120000,          // 2 min timeout for slow connections
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message || error);
    throw new Error(`Image upload failed: ${error.message || "Unknown error"}`);
  }
};

export default cloudinary;