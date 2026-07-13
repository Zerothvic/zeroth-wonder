import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

await mongoose.connect(process.env.MONGO_URI);

const users = await User.find({ username: { $exists: false } });
for (const user of users) {
  let base = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
  let candidate = base;
  let n = 1;
  while (await User.exists({ username: candidate })) {
    candidate = `${base}${n++}`;
  }
  user.username = candidate;
  await user.save();
  console.log(`${user.email} -> username: ${candidate}`);
}

await mongoose.disconnect();
console.log("Done.");