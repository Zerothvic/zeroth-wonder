import mongoose from "mongoose";

const generationJobSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productType: { type: String, required: true },
    prompt: { type: String, required: true },
    promptSummary: { type: String }, // clean, question-free version for display on generated images
    status: { type: String, enum: ["queued", "processing", "ready", "failed"], default: "queued" },
    moderationStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    provider: { type: String },
    attempts: { type: Number, default: 0 },
    resultAssetUrl: { type: String },
    resultPublicId: { type: String },
    resultResourceType: { type: String },
    failureReason: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("GenerationJob", generationJobSchema);