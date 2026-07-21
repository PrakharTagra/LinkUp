import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const maskedUri = process.env.MONGO_URI 
      ? process.env.MONGO_URI.replace(/:([^:@]+)@/, ':***@') 
      : 'UNDEFINED';
    console.log(`[DEBUG] Attempting to connect with URI: >${maskedUri}<`);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, 
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4. Atlas free tier doesn't support IPv6 and Node 18+ tries IPv6 first.
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    if (error.message.includes("whitelist")) {
      console.warn("👉 TIP: Check your MongoDB Atlas Network Access settings (whitelist your current IP).");
    }
    throw error; // Rethrow to let the caller (index.js) handle it
  }
};

export default connectDB;