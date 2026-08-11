import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import UnlockRule from "../models/UnlockRule.js";

await mongoose.connect(process.env.MONGO_URI);

const products = [
  {
    type: "fortune",
    title: "Chaotic Fortune Reading",
    description: "A 150-word unhinged, funny fortune reading, just for you.",
    coinPrice: 25,
    sampleAssetUrl: "https://placehold.co/600x400/EDC45A/2B2118?text=Fortune+Reading",
    rule: { requiresLikes: 5 },
    promptQuestions: [
      "What's a decision you've been chaotically avoiding?",
      "Pick one: a black cat, a broken mirror, or a Monday. Which one scares you more?",
      "If your life had a plot twist next week, what would you want it to be?",
      "Name one thing you secretly hope the universe notices about you.",
      "What's your lucky (or unlucky) number, and why does it haunt you?",
    ],
  },
  {
    type: "song",
    title: "Your 1-Minute Song",
    description: "A short original song generated from your prompt, DJ shout-out included.",
    coinPrice: 60,
    sampleAssetUrl: "https://placehold.co/600x400/65BCB5/E9CEAF?text=Your+Song",
    rule: { requiresLikes: 5, requiresComments: true },
    promptQuestions: [
      "What's the theme or story you want your song to tell?",
      "Pick a mood: triumphant, heartbroken, chaotic, or chill?",
      "Is there a name, place, or inside joke that has to make it into the lyrics?",
      "What genre fits your mood today — rap, pop, ballad, or something weirder?",
      "If this song played during the credits of your life, what moment would be on screen?",
    ],
  },
  {
    type: "conversation",
    title: "Talk to Your Past or Future Self",
    description: "A 15-minute AI conversation with a version of you.",
    coinPrice: 90,
    sampleAssetUrl: "https://placehold.co/600x400/E9CEAF/ED802A?text=Past+%2F+Future+Self",
    rule: { requiresLikes: 5, requiresComments: true, requiresSignup: true },
    promptQuestions: [
      "Are you speaking to your past self or your future self?",
      "What age or moment in time are you trying to reach?",
      "What's one question you've always wanted to ask them?",
      "What's something you'd want them to know before anything else?",
      "What's one memory or detail that would prove it's really you?",
    ],
  },
  {
    type: "comic",
    title: "5-Page Life Comic Book",
    description: "A minimalist, colorful comic about your life, downloadable as a PDF.",
    coinPrice: 150,
    sampleAssetUrl: "https://placehold.co/600x400/ED802A/E9CEAF?text=Life+Comic+Book",
    rule: { requiresLikes: 5, requiresComments: true, requiresSignup: true, requiresSharePlatforms: 3 },
    promptQuestions: [
      "What's the opening scene of your story?",
      "Who's the supporting character (real or imagined) who shows up in your life story?",
      "What's your biggest 'plot twist' moment so far?",
      "What's the obstacle your comic-book self has to overcome?",
      "How do you want the final page to end?",
    ],
  },
  {
    type: "documentary",
    title: "2-Minute Cartoon Documentary",
    description: "An animated mini-documentary about your life.",
    coinPrice: 150,
    sampleAssetUrl: "https://placehold.co/600x400/2B2118/EDC45A?text=Cartoon+Documentary",
    rule: { requiresLikes: 5, requiresComments: true, requiresSignup: true, requiresSharePlatforms: 3 },
    promptQuestions: [
      "If this documentary opened with narration, what's the first line?",
      "What's a defining chapter of your life so far?",
      "Who or what would you credit as your biggest influence?",
      "What's a challenge you overcame that deserves a dramatic music cue?",
      "How do you want viewers to feel by the end?",
    ],
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
      promptQuestions: p.promptQuestions,
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