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
      displayName: req.user.displayName,
      coinBalance: req.user.coinBalance,
      isAdmin: req.user.isAdmin,
    },
    cart,
    purchases,
  });
});

// DELETE /api/profile/purchases/:jobId — removes both the DB record and the
// actual Cloudinary file, so nothing gets orphaned in storage.
router.delete("/purchases/:jobId", requireAuth, async (req, res) => {
  try {
    const job = await GenerationJob.findOne({ _id: req.params.jobId, userId: req.user._id });
    if (!job) return res.status(404).json({ error: "Not found" });

    if (job.resultPublicId) {
      try {
        await deleteFromCloudinary(job.resultPublicId, job.resultResourceType || "image");
      } catch (err) {
        // Log but don't block deletion of the DB record on a storage-side failure —
        // an orphaned Cloudinary file is a much smaller problem than a user being
        // unable to remove something from their own list.
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