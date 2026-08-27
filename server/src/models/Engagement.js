import mongoose from "mongoose";

const engagementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    type: { type: String, enum: ["like", "comment", "share", "signup"], required: true },
    platform: { type: String, enum: ["facebook", "instagram", "twitter", "whatsapp", "linkedin", null], default: null },
    text: { type: String },
    coinsAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Uniqueness is only enforced for likes and platform-specific shares —
// each of those can only ever be rewarded once per user per product.
// Comments are deliberately excluded: users can post as many as they want,
// and each one earns coins (see engagementRoutes.js).
engagementSchema.index(
  { userId: 1, productId: 1, type: 1, platform: 1 },
  {
    unique: true,
    partialFilterExpression: {
      userId: { $exists: true },
      type: { $in: ["like", "share"] },
    },
  }
);

engagementSchema.index(
  { sessionId: 1, productId: 1, type: 1, platform: 1 },
  { unique: true, partialFilterExpression: { sessionId: { $exists: true } } }
);

export default mongoose.model("Engagement", engagementSchema);