import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import { applyCoinDelta } from "../services/coinEngine.js";

const email = process.argv[2];
const amount = Number(process.argv[3]);

if (!email || !amount || Number.isNaN(amount)) {
  console.error("Usage: npm run grant-coins -- your@email.com 50");
  console.error("       (use a negative number to deduct, e.g. -20)");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const user = await User.findOne({ email: email.toLowerCase() });
if (!user) {
  console.error(`No user found with email: ${email}`);
  await mongoose.disconnect();
  process.exit(1);
}

try {
  const newBalance = await applyCoinDelta({
    userId: user._id,
    delta: amount,
    reason: "admin:manual-grant",
  });
  console.log(`✅ ${amount > 0 ? "Granted" : "Deducted"} ${Math.abs(amount)} coins ${amount > 0 ? "to" : "from"} ${user.email}. New balance: ${newBalance}`);
} catch (err) {
  if (err.message === "INSUFFICIENT_COINS") {
    console.error(`❌ Can't deduct ${Math.abs(amount)} coins — ${user.email} only has ${user.coinBalance}.`);
  } else {
    console.error("❌ Failed:", err.message);
  }
}

await mongoose.disconnect();