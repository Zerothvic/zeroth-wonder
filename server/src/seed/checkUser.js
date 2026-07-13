import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const identifier = process.argv[2];
if (!identifier) {
  console.error("Usage: npm run check-user -- your@email.com-or-username");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const lower = identifier.toLowerCase();
const user = await User.findOne({ $or: [{ email: lower }, { username: lower }] });

if (!user) {
  console.log("No user found matching that identifier.");
} else {
  console.log({
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    isVerified: user.isVerified,
    isSuspended: user.isSuspended,
    hasPasswordHash: !!user.passwordHash,
  });
}

await mongoose.disconnect();