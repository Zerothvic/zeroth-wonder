import mongoose from "mongoose";

// Unlock rules live as DATA, not if/else in controllers (bottleneck 12.9).
// One generic unlockEngine.js evaluates every product against its rule doc.
const unlockRuleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, unique: true },
  requiresLikes: { type: Number, default: 0 },
  requiresComments: { type: Boolean, default: false },
  requiresSignup: { type: Boolean, default: false },
  requiresSharePlatforms: { type: Number, default: 0 }, // e.g. 3 distinct platforms on ONE product
});

export default mongoose.model("UnlockRule", unlockRuleSchema);