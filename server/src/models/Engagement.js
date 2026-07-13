import mongoose from "mongoose";

const engagementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // null for guests
    sessionId: { type: String }, // guest tracking, migrated to userId on signup
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    type: { type: String, enum: ["like", "comment", "share", "signup"], required: true },
    platform: { type: String, enum: ["facebook", "instagram", "twitter", "whatsapp", "linkedin", null], default: null },
    coinsAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Enforces the "1 reward per user per product per type[/platform]" caps from PRD 4.1
// This index is the actual anti-farming control (bottleneck 12.5), not app logic.
engagementSchema.index(
  { userId: 1, productId: 1, type: 1, platform: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: true } } }
);
engagementSchema.index(
  { sessionId: 1, productId: 1, type: 1, platform: 1 },
  { unique: true, partialFilterExpression: { sessionId: { $exists: true } } }
);

export default mongoose.model("Engagement", engagementSchema);