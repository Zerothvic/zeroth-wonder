import { Router } from "express";
import mongoose from "mongoose";
import CartItem from "../models/CartItem.js";
import GenerationJob from "../models/GenerationJob.js";
import { requireAuth } from "../middleware/auth.js";
import { checkoutLimiter } from "../middleware/rateLimit.js";
import { applyCoinDelta, withTransaction } from "../services/coinEngine.js";
import { getUnlockProgress } from "../services/unlockEngine.js";
import { precheckPrompt } from "../services/moderation.js";
import { generationQueue } from "../queues/generationQueue.js";

const router = Router();

// POST /api/checkout — body: { items: [{ productId, prompt }] }
// Bottleneck 12.4 + 12.6: deduct coins and create jobs inside ONE transaction,
// then enqueue to BullMQ only after the transaction commits, so a queue failure
// can never leave coins silently spent with no job created.
router.post("/", checkoutLimiter, requireAuth, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items to checkout" });
    }

    const createdJobs = await withTransaction(async (session) => {
      const jobs = [];
      for (const { productId, prompt, promptSummary } of items) {
        const cartItem = await CartItem.findOne({ userId: req.user._id, productId }).populate("productId").session(session);
        if (!cartItem) throw new Error(`Item not in cart: ${productId}`);

        const { unlocked } = await getUnlockProgress(req.user._id, true, productId);
        if (!unlocked) throw new Error(`Not unlocked: ${cartItem.productId.title}`);

        const check = precheckPrompt(prompt);
        if (!check.allowed) throw new Error(`Prompt rejected for "${cartItem.productId.title}": ${check.reason}`);

        await applyCoinDelta({
          userId: req.user._id,
          delta: -cartItem.productId.coinPrice,
          reason: `checkout:${cartItem.productId.type}`,
          session,
        });

        const [job] = await GenerationJob.create(
          [{
            userId: req.user._id,
            productId,
            productType: cartItem.productId.type,
            prompt,
            promptSummary,
            moderationStatus: check.needsReview ? "pending" : "approved",
          }],
          { session }
        );
        jobs.push(job);
        await CartItem.deleteOne({ _id: cartItem._id }).session(session);
      }
      return jobs;
    });

    // Enqueue AFTER the DB transaction commits successfully.
    for (const job of createdJobs) {
      await generationQueue.add("generate", { jobId: job._id.toString() });
    }

    res.status(201).json({ jobs: createdJobs.map((j) => ({ id: j._id, status: j.status })) });
  } catch (err) {
    if (err.message === "INSUFFICIENT_COINS") {
      return res.status(402).json({ error: "Not enough coins" });
    }
    res.status(400).json({ error: err.message });
  }
});

export default router;