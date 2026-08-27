import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import CartItem from "../models/CartItem.js";
import GenerationJob from "../models/GenerationJob.js";
import { deleteFromCloudinary } from "../services/storage.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const [cart, purchases] = await Promise.all([
    CartItem.find({ userId: req.user._id }).populate("productId"),
    GenerationJob.find({ userId: req.user._id }).populate("productId").sort({ createdAt: -1 }),
  ]);
  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      username: req.user.username,
      coinBalance: req.user.coinBalance,
      isAdmin: req.user.isAdmin,
      lastEngagementResetAt: req.user.lastEngagementResetAt,
    },
    cart,
    purchases,
  });
});

router.delete("/purchases/:jobId", requireAuth, async (req, res) => {
  try {
    const job = await GenerationJob.findOne({ _id: req.params.jobId, userId: req.user._id });
    if (!job) return res.status(404).json({ error: "Not found" });

    if (job.resultPublicId) {
      try {
        await deleteFromCloudinary(job.resultPublicId, job.resultResourceType || "image");
      } catch (err) {
        console.error("[profile] Cloudinary delete failed:", err.message);
      }
    }

    await GenerationJob.deleteOne({ _id: job._id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;