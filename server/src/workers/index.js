import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import GenerationJob from "../models/GenerationJob.js";
import { runFortuneJob } from "./fortuneWorker.js";
import { runComicJob } from "./comicWorker.js";
import { runSongJob } from "./songWorker.js";
import { runDocumentaryJob } from "./documentaryWorker.js";

// Bind the port FIRST, before any await — Render's port scanner needs to see this immediately, independent of how long Mongo/Redis take to connect.
const healthApp = express();
healthApp.get("/health", (req, res) => res.json({ ok: true, worker: "running" }));
const PORT = process.env.PORT || 10000;
healthApp.listen(PORT, () => console.log(`[worker] health endpoint on :${PORT}`));

await mongoose.connect(process.env.MONGO_URI);
console.log("[worker] connected to MongoDB, listening on 'generation' queue");

const HANDLERS = {
  fortune: runFortuneJob,
  comic: runComicJob,
  song: runSongJob,
  documentary: runDocumentaryJob,
};

new Worker(
  "generation",
  async (job) => {
    const genJob = await GenerationJob.findById(job.data.jobId);
    if (!genJob) throw new Error("GenerationJob not found");
    if (genJob.moderationStatus === "rejected") {
      genJob.status = "failed";
      genJob.failureReason = "Rejected by moderation";
      await genJob.save();
      return;
    }

    genJob.status = "processing";
    genJob.attempts += 1;
    await genJob.save();

    const handler = HANDLERS[genJob.productType];
    if (!handler) throw new Error(`No worker for product type: ${genJob.productType}`);

    try {
      const { assetUrl, provider } = await handler(genJob);
      genJob.status = "ready";
      genJob.resultAssetUrl = assetUrl;
      genJob.provider = provider;
      genJob.completedAt = new Date();
      await genJob.save();
    } catch (err) {
      genJob.status = "failed";
      genJob.failureReason = err.message;
      await genJob.save();
      throw err;
    }
  },
  { connection: redisConnection, concurrency: 3 }
);