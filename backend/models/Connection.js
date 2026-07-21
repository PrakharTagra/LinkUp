import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, refPath: 'fromModel', required: true },
    fromModel: { type: String, enum: ['Student', 'Alumni', 'Admin'], required: true },
    to: { type: mongoose.Schema.Types.ObjectId, refPath: 'toModel', required: true },
    toModel: { type: String, enum: ['Student', 'Alumni', 'Admin'], required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection;