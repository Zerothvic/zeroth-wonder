import "dotenv/config";
import mongoose from "mongoose";
import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import GenerationJob from "../models/GenerationJob.js";
import { runFortuneJob } from "./fortuneWorker.js";
import { runComicJob } from "./comicWorker.js";
import { runSongJob } from "./songWorker.js";
import { runDocumentaryJob } from "./documentaryWorker.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("[worker] connected to MongoDB, listening on 'generation' queue");

const HANDLERS = {
  fortune: runFortuneJob,
  comic: runComicJob,
  song: runSongJob,
  documentary: runDocumentaryJob,
};

// This process runs SEPARATELY from the Express API (npm run worker).
// Bottleneck 12.4: long AI calls happen here, never inside an HTTP request.
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
      throw err; // let BullMQ retry per queue settings
    }
  },
  { connection: redisConnection, concurrency: 3 }
);