import { Router } from "express";
import CartItem from "../models/CartItem.js";
import { requireAuth } from "../middleware/auth.js";
import { getUnlockProgress } from "../services/unlockEngine.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const items = await CartItem.find({ userId: req.user._id }).populate("productId");
  res.json(items);
});

// POST /api/cart — only allow adding a product that's actually unlocked
router.post("/", requireAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    const { unlocked } = await getUnlockProgress(req.user._id, true, productId);
    if (!unlocked) return res.status(403).json({ error: "Product not yet unlocked" });

    const item = await CartItem.findOneAndUpdate(
      { userId: req.user._id, productId },
      { userId: req.user._id, productId },
      { upsert: true, new: true }
    );
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:productId", requireAuth, async (req, res) => {
  await CartItem.deleteOne({ userId: req.user._id, productId: req.params.productId });
  res.json({ ok: true });
});

export default router;
