import { Router } from "express";
import Product from "../models/Product.js";
import UnlockRule from "../models/UnlockRule.js";
import { optionalAuth } from "../middleware/auth.js";
import { getUnlockProgress } from "../services/unlockEngine.js";

const router = Router();

// GET /api/products — catalogue with per-user (or per-guest-session) lock status
router.get("/", optionalAuth, async (req, res) => {
  const products = await Product.find({ isActive: true });
  const identity = req.user ? req.user._id.toString() : req.cookies?.guestSessionId;

  const withStatus = await Promise.all(
    products.map(async (product) => {
      let unlocked = false;
      if (identity) {
        try {
          const result = await getUnlockProgress(identity, !!req.user, product._id);
          unlocked = result.unlocked;
        } catch {
          unlocked = false;
        }
      }
      return { ...product.toObject(), unlocked };
    })
  );

  res.json(withStatus);
});

// GET /api/products/:id — single product + live unlock progress
router.get("/:id", optionalAuth, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });

  const identity = req.user ? req.user._id.toString() : req.cookies?.guestSessionId;
  let unlockData = { unlocked: false, progress: null };
  if (identity) {
    try {
      unlockData = await getUnlockProgress(identity, !!req.user, product._id);
    } catch {
      /* no rule configured yet */
    }
  }

  res.json({ ...product.toObject(), ...unlockData });
});

export default router;