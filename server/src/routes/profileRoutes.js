import { Router } from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import { requireAuth } from "../middleware/auth.js";
import CartItem from "../models/CartItem.js";
import GenerationJob from "../models/GenerationJob.js";
import User from "../models/User.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../services/storage.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// GET /api/profile
router.get("/", requireAuth, async (req, res) => {
  try {
    const [cart, purchases] = await Promise.all([
      CartItem.find({ userId: req.user._id }).populate("productId"),
      GenerationJob.find({ userId: req.user._id }).populate("productId").sort({ createdAt: -1 }),
    ]);

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        avatarUrl: req.user.avatarUrl,
        coinBalance: req.user.coinBalance,
        isAdmin: req.user.isAdmin,
        lastEngagementResetAt: req.user.lastEngagementResetAt,
      },
      cart,
      purchases,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profile — update username, email, and/or password
router.put("/", requireAuth, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (username && username.trim().toLowerCase() !== user.username) {
      const cleanUsername = username.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(cleanUsername)) {
        return res.status(400).json({ error: "Username must be 3-20 alphanumeric characters (_ . - allowed)" });
      }
      const existing = await User.findOne({ username: cleanUsername, _id: { $ne: user._id } });
      if (existing) return res.status(409).json({ error: "Username is already taken" });
      user.username = cleanUsername;
      user.displayName = cleanUsername;
    }

    if (email && email.trim().toLowerCase() !== user.email) {
      const cleanEmail = email.trim().toLowerCase();
      const existing = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
      if (existing) return res.status(409).json({ error: "Email is already taken" });
      user.email = cleanEmail;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to set a new password" });
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters long" });
      }
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        coinBalance: user.coinBalance,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/profile/avatar — upload avatar to Cloudinary
router.post("/avatar", requireAuth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image file provided" });

    const user = await User.findById(req.user._id);

    if (user.avatarPublicId) {
      try {
        await deleteFromCloudinary(user.avatarPublicId, "image");
      } catch (err) {
        console.error("[avatar] Failed to delete previous avatar:", err.message);
      }
    }

    const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, "zeroth-wonder/avatars");
    user.avatarUrl = url;
    user.avatarPublicId = publicId;
    await user.save();

    res.json({ avatarUrl: user.avatarUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/profile/purchases/:jobId
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