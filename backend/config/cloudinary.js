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
  console.warn(
    "⚠️ Warning: Cloudinary env vars missing (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Media uploads will be disabled until configured."
  );
} else {
  // 🔹 Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

// 🔹 Upload Image/Video Function (supports base64 data URIs)
export const uploadImage = async (file, folder = "connect_platform") => {
  const currentCloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const currentApiKey = process.env.CLOUDINARY_API_KEY;
  const currentApiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!currentCloudName || !currentApiKey || !currentApiSecret) {
    console.warn("[Cloudinary] Credentials missing on runtime. Using direct media fallback.");
    return {
      public_id: `fallback_${Date.now()}`,
      url: file,
      resource_type: "image",
    };
  }

  // Ensure config is loaded if env vars arrived after module initialization
  cloudinary.config({
    cloud_name: currentCloudName,
    api_key: currentApiKey,
    api_secret: currentApiSecret,
  });

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",   // handles images AND videos
      chunk_size: 6000000,      // 6MB chunks for large files
      timeout: 15000,           // 15 sec timeout
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.warn("[Cloudinary] Upload Error:", error.message || error);
    // If upload fails, fallback to direct data URI or URL so profile and posts never crash
    if (typeof file === "string") {
      return {
        public_id: `fallback_${Date.now()}`,
        url: file,
        resource_type: "image",
      };
    }
    throw new Error(`Image upload failed: ${error.message || "Unknown error"}`);
  }
};

export default cloudinary;