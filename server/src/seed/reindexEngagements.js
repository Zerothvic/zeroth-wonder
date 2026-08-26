import "dotenv/config";
import mongoose from "mongoose";
import Engagement from "../models/Engagement.js";

await mongoose.connect(process.env.MONGO_URI);

const rawCollection = Engagement.collection;
const before = await rawCollection.indexes();
console.log("Indexes before:", before.map((i) => i.name));

for (const idx of before) {
  if (idx.name !== "_id_") {
    await rawCollection.dropIndex(idx.name);
    console.log(`Dropped: ${idx.name}`);
  }
}

await Engagement.syncIndexes();

const after = await rawCollection.indexes();
console.log("Indexes after:", after.map((i) => i.name));

await mongoose.disconnect();
console.log("Done.");