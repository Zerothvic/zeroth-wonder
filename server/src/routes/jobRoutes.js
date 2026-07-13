import { Router } from "express";
import GenerationJob from "../models/GenerationJob.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/jobs/:id — polled by the client while a job is queued/processing
router.get("/:id", requireAuth, async (req, res) => {
  const job = await GenerationJob.findOne({ _id: req.params.id, userId: req.user._id });
  if (!job) return res.status(404).json({ error: "Not found" });
  res.json(job);
});

export default router;