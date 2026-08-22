import mongoose from "mongoose";

const engagementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    type: { type: String, enum: ["like", "comment", "share", "signup"], required: true },
    platform: { type: String, enum: ["facebook", "instagram", "twitter", "whatsapp", "linkedin", null], default: null },
    text: { type: String }, // only set for type: "comment" — the actual comment content, shown on the product page
    coinsAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Blocks duplicate LIKE/SHARE rewards outright, and blocks a second REWARDED
// comment — but allows unlimited additional (zero-coin) comments per user.
engagementSchema.index(
  { userId: 1, productId: 1, type: 1, platform: 1 },
  {
    unique: true,
    partialFilterExpression: {
      userId: { $exists: true },
      $or: [{ type: { $ne: "comment" } }, { coinsAwarded: { $gt: 0 } }],
    },
  }
);
engagementSchema.index(
  { sessionId: 1, productId: 1, type: 1, platform: 1 },
  { unique: true, partialFilterExpression: { sessionId: { $exists: true } } }
);

export default mongoose.model("Engagement", engagementSchema);