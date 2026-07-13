import mongoose from "mongoose";
import User from "../models/User.js";
import CoinLedger from "../models/CoinLedger.js";

/**
 * The ONLY function allowed to change a user's coin balance.
 * Bottleneck 12.6: race conditions / balance corruption.
 * - Uses an atomic $inc (not read-then-write) so concurrent requests can't clobber each other.
 * - Writes an append-only ledger entry as the audit trail / source of truth.
 * - Wrapped in a Mongo transaction when called from checkout (see checkoutRoutes.js)
 *   so "coins deducted" and "job created" succeed or fail together.
 */
export async function applyCoinDelta({ userId, delta, reason, refId, session = null }) {
  const opts = session ? { session, new: true } : { new: true };

  if (delta < 0) {
    // Guard against overspend atomically: only decrement if balance is sufficient.
    const user = await User.findOneAndUpdate(
      { _id: userId, coinBalance: { $gte: -delta } },
      { $inc: { coinBalance: delta } },
      opts
    );
    if (!user) throw new Error("INSUFFICIENT_COINS");
    await CoinLedger.create(
      [{ userId, delta, reason, refId, balanceAfter: user.coinBalance }],
      session ? { session } : {}
    );
    return user.coinBalance;
  }

  const user = await User.findByIdAndUpdate(userId, { $inc: { coinBalance: delta } }, opts);
  await CoinLedger.create(
    [{ userId, delta, reason, refId, balanceAfter: user.coinBalance }],
    session ? { session } : {}
  );
  return user.coinBalance;
}

export async function withTransaction(fn) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    session.endSession();
  }
}