import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Engagement from "../models/Engagement.js";
import { applyCoinDelta } from "../services/coinEngine.js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run grant-signup -- your@email.com");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const user = await User.findOne({ email: email.toLowerCase() });
if (!user) {
  console.error(`No user found with email: ${email}`);
  await mongoose.disconnect();
  process.exit(1);
}

const already = await Engagement.findOne({ userId: user._id, type: "signup" });
if (already) {
  console.log(`${user.email} already has a signup engagement — nothing to do.`);
  await mongoose.disconnect();
  process.exit(0);
}

const anyProduct = await Product.findOne();
if (!anyProduct) {
  console.error("No products found — run the product seed first.");
  await mongoose.disconnect();
  process.exit(1);
}

const engagement = await Engagement.create({
  userId: user._id,
  productId: anyProduct._id,
  type: "signup",
  coinsAwarded: 25,
});
await applyCoinDelta({ userId: user._id, delta: 25, reason: "engagement:signup:backfill", refId: engagement._id });

console.log(`✅ Granted signup credit to ${user.email} (+25 coins). Signup-gated products should now unlock correctly.`);

await mongoose.disconnect();