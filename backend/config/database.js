import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If already connected, reuse existing connection immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn("⚠️ MONGO_URI environment variable is not defined");
      return null;
    }

    const maskedUri = uri.replace(/:([^:@]+)@/, ":***@");
    console.log(`[Database] Connecting to MongoDB: ${maskedUri}`);

    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 for Atlas compatibility
    }).then((mongooseInstance) => {
      console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}/${mongooseInstance.connection.name}`);
      return mongooseInstance.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("❌ Database connection error:", error.message);
    if (error.message.includes("whitelist")) {
      console.warn("👉 TIP: In MongoDB Atlas Network Access, allow access from anywhere (0.0.0.0/0).");
    }
    throw error;
  }
};

export default connectDB;
