import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import UnlockRule from "../models/UnlockRule.js";

await mongoose.connect(process.env.MONGO_URI);

// Placeholder images themed to the Zeroth Wonder palette.
// Swap sampleAssetUrl for a real generated sample once you have one.
const products = [
  {
    type: "fortune",
    title: "Chaotic Fortune Reading",
    description: "A 150-word unhinged, funny fortune reading, just for you.",
    coinPrice: 25,
    sampleAssetUrl: "https://placehold.co/600x400/EDC45A/2B2118?text=Fortune+Reading",
    rule: { requiresLikes: 5 },
  },
  {
    type: "song",
    title: "Your 1-Minute Song",
    description: "A short original song generated from your prompt, DJ shout-out included.",
    coinPrice: 60,
    sampleAssetUrl: "https://placehold.co/600x400/65BCB5/E9CEAF?text=Your+Song",
    rule: { requiresLikes: 5, requiresComments: true },
  },
  {
    type: "conversation",
    title: "Talk to Your Past or Future Self",
    description: "A 15-minute AI conversation with a version of you.",
    coinPrice: 90,
    sampleAssetUrl: "https://placehold.co/600x400/E9CEAF/ED802A?text=Past+%2F+Future+Self",
    rule: { requiresLikes: 5, requiresComments: true, requiresSignup: true },
  },
  {
    type: "comic",
    title: "5-Page Life Comic Book",
    description: "A minimalist, colorful comic about your life, downloadable as a PDF.",
    coinPrice: 150,
    sampleAssetUrl: "https://placehold.co/600x400/ED802A/E9CEAF?text=Life+Comic+Book",
    rule: { requiresLikes: 5, requiresComments: true, requiresSignup: true, requiresSharePlatforms: 3 },
  },
  {
    type: "documentary",
    title: "2-Minute Cartoon Documentary",
    description: "An animated mini-documentary about your life.",
    coinPrice: 150,
    sampleAssetUrl: "https://placehold.co/600x400/2B2118/EDC45A?text=Cartoon+Documentary",
    rule: { requiresLikes: 5, requiresComments: true, requiresSignup: true, requiresSharePlatforms: 3 },
  },
];

for (const p of products) {
  const product = await Product.findOneAndUpdate(
    { type: p.type },
    {
      type: p.type,
      title: p.title,
      description: p.description,
      coinPrice: p.coinPrice,
      sampleAssetUrl: p.sampleAssetUrl,
      isActive: true,
    },
    { upsert: true, new: true }
  );
  await UnlockRule.findOneAndUpdate(
    { productId: product._id },
    { productId: product._id, ...p.rule },
    { upsert: true }
  );
  console.log(`Seeded: ${p.title}`);
}

await mongoose.disconnect();
console.log("Done.");