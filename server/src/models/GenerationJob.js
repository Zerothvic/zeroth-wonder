import mongoose from "mongoose";

const generationJobSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productType: { type: String, required: true },
    prompt: { type: String, required: true },
    status: { type: String, enum: ["queued", "processing", "ready", "failed"], default: "queued" },
    moderationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    provider: { type: String },
    attempts: { type: Number, default: 0 },
    resultAssetUrl: { type: String },
    failureReason: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("GenerationJob", generationJobSchema);