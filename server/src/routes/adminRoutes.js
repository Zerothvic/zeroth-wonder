import { Router } from "express";
import multer from "multer";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import Product from "../models/Product.js";
import UnlockRule from "../models/UnlockRule.js";
import GenerationJob from "../models/GenerationJob.js";
import User from "../models/User.js";
import { uploadBufferToCloudinary } from "../services/storage.js";

const router = Router();
router.use(requireAuth, requireAdmin);

// In-memory storage: file never touches disk, goes straight to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

router.get("/products", async (req, res) => {
  const products = await Product.find();
  const withRules = await Promise.all(
    products.map(async (p) => {
      const rule = await UnlockRule.findOne({ productId: p._id });
      return { ...p.toObject(), unlockRule: rule };
    })
  );
  res.json(withRules);
});

router.put("/products/:id", async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
});

// POST /api/admin/products/:id/thumbnail — multipart file upload
router.post("/products/:id/thumbnail", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image file provided" });

    const imageUrl = await uploadBufferToCloudinary(req.file.buffer, "zeroth-wonder/products");
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { sampleAssetUrl: imageUrl },
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/unlock-rules/:productId", async (req, res) => {
  const rule = await UnlockRule.findOneAndUpdate(
    { productId: req.params.productId },
    { $set: req.body },
    { new: true, upsert: true }
  );
  res.json(rule);
});

router.get("/moderation", async (req, res) => {
  const jobs = await GenerationJob.find({ moderationStatus: "pending" }).populate("productId userId");
  res.json(jobs);
});

router.put("/moderation/:jobId", async (req, res) => {
  const { decision } = req.body;
  const job = await GenerationJob.findByIdAndUpdate(req.params.jobId, { moderationStatus: decision }, { new: true });
  res.json(job);
});

router.get("/users", async (req, res) => {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 }).limit(200);
  res.json(users);
});

router.put("/users/:id/suspend", async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: true }, { new: true });
  res.json(user);
});

export default router;