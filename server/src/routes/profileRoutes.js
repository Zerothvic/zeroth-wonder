import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import CartItem from "../models/CartItem.js";
import GenerationJob from "../models/GenerationJob.js";

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

export default router;