import mongoose from "mongoose";

// Append-only. Never mutate a past entry or write coinBalance directly from
// client input — this collection is the source of truth (bottleneck 12.6).
const coinLedgerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    delta: { type: Number, required: true }, // positive = earn, negative = spend
    reason: { type: String, required: true }, // e.g. "engagement:like", "checkout:comic"
    refId: { type: mongoose.Schema.Types.ObjectId }, // Engagement._id or GenerationJob._id
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("CoinLedger", coinLedgerSchema);