import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import Engagement from "../models/Engagement.js";
import Product from "../models/Product.js";
import { applyCoinDelta } from "../services/coinEngine.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { engagementLimiter } from "../middleware/rateLimit.js";
import User from "../models/User.js";

const router = Router();
const COIN_VALUES = { like: 5, comment: 10, share: 15 };

function ensureGuestSession(req, res) {
  let sessionId = req.cookies?.guestSessionId;
  if (!sessionId) {
    sessionId = uuidv4();
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("guestSessionId", sessionId, {
      maxAge: 90 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
  }
  return sessionId;
}

// POST /api/engagements/like — guests allowed, but coins only ever post to a real user
router.post("/like", engagementLimiter, optionalAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const identity = req.user
      ? { userId: req.user._id }
      : { sessionId: ensureGuestSession(req, res) };

    const coins = req.user ? COIN_VALUES.like : 0; // guests earn 0 spendable coins until they sign up
    const engagement = await Engagement.create({ ...identity, productId, type: "like", coinsAwarded: coins });

    if (req.user && coins > 0) {
      await applyCoinDelta({ userId: req.user._id, delta: coins, reason: "engagement:like", refId: engagement._id });
    }
    res.status(201).json({ engagement });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Already liked" });
    res.status(500).json({ error: err.message });
  }
});

// POST /api/engagements/comment — requires an account (coins only make sense for real users)
router.post("/comment", engagementLimiter, requireAuth, async (req, res) => {
  try {
    const { productId, text } = req.body;
    if (!text || text.trim().length < 8) {
      return res.status(400).json({ error: "Comment must be at least 8 characters" });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // First comment on this product earns coins (unique index below enforces
    // one rewarded comment per user per product); further comments still
    // save and display, just without a second coin payout.
    let coinsAwarded = 0;
    let engagement;
    try {
      engagement = await Engagement.create({
        userId: req.user._id, productId, type: "comment", text: text.trim(), coinsAwarded: COIN_VALUES.comment,
      });
      coinsAwarded = COIN_VALUES.comment;
      await applyCoinDelta({ userId: req.user._id, delta: COIN_VALUES.comment, reason: "engagement:comment", refId: engagement._id });
    } catch (err) {
      if (err.code !== 11000) throw err;
      // Reward already claimed on this product — still save the comment itself,
      // just as a non-unique, non-rewarded entry so it shows up in the list.
      engagement = await Engagement.create({
        userId: req.user._id, productId, type: "comment", text: text.trim(), coinsAwarded: 0,
      });
    }

    res.status(201).json({ engagement, coinsAwarded });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/engagements/share/confirm — bottleneck 12.1: honor-system + confirmation click,
// never trust the initial share-intent click alone.
router.post("/share/confirm", engagementLimiter, requireAuth, async (req, res) => {
  try {
    const { productId, platform } = req.body;
    const allowed = ["facebook", "instagram", "twitter", "whatsapp", "linkedin"];
    if (!allowed.includes(platform)) return res.status(400).json({ error: "Unknown platform" });

    const existingPlatforms = await Engagement.distinct("platform", {
      userId: req.user._id, productId, type: "share",
    });
    if (existingPlatforms.length >= 3 && !existingPlatforms.includes(platform)) {
      return res.status(200).json({ message: "Max 3 rewarded platforms per product already reached" });
    }

    const engagement = await Engagement.create({
      userId: req.user._id, productId, type: "share", platform, coinsAwarded: COIN_VALUES.share,
    });
    await applyCoinDelta({ userId: req.user._id, delta: COIN_VALUES.share, reason: "engagement:share", refId: engagement._id });
    res.status(201).json({ engagement });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Already rewarded for this platform" });
    res.status(500).json({ error: err.message });
  }
});

const RESET_COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3 hours

router.post("/reset", requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const now = Date.now();
    const last = user.lastEngagementResetAt ? new Date(user.lastEngagementResetAt).getTime() : 0;
    const elapsed = now - last;

    if (elapsed < RESET_COOLDOWN_MS) {
      const remainingMs = RESET_COOLDOWN_MS - elapsed;
      return res.status(429).json({
        error: "You can reset your engagements again soon.",
        remainingMs,
      });
    }

    await Engagement.deleteMany({ userId: user._id, type: { $nin: ["signup", "comment"] } });
    user.lastEngagementResetAt = new Date(now);
    await user.save();

    res.json({ message: "Engagements reset. You can start earning coins again!", lastEngagementResetAt: user.lastEngagementResetAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/engagements/comments/:productId — public list of comments on a product
router.get("/comments/:productId", async (req, res) => {
  try {
    const comments = await Engagement.find({
      productId: req.params.productId,
      type: "comment",
      text: { $exists: true, $ne: "" },
    })
      .populate("userId", "displayName username")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(
      comments.map((c) => ({
        id: c._id,
        text: c.text,
        userId: c.userId?._id || null,
        displayName: c.userId?.displayName || "Someone",
        createdAt: c.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/engagements/comments/:id — edit your own comment text
router.put("/comments/:id", requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 8) {
      return res.status(400).json({ error: "Comment must be at least 8 characters" });
    }
    const comment = await Engagement.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, type: "comment" },
      { text: text.trim() },
      { new: true }
    );
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json({ comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/engagements/comments/:id — remove your own comment.
// Coins already earned from a first comment are NOT clawed back — deleting
// just removes the comment's visibility, consistent with how deleting a
// purchase doesn't refund coins either.
router.delete("/comments/:id", requireAuth, async (req, res) => {
  try {
    const comment = await Engagement.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
      type: "comment",
    });
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;