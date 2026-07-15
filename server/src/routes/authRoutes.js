import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Engagement from "../models/Engagement.js";
import Product from "../models/Product.js";
import { applyCoinDelta } from "../services/coinEngine.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { sendVerificationEmail } from "../services/mailer.js";

const router = Router();

function issueTokens(res, user) {
  const accessToken = jwt.sign({ sub: user._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ sub: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });
  const isProd = process.env.NODE_ENV === "production";
  // Cross-domain cookies (Vercel client + Render API) require sameSite:"none", which itself requires secure:true — browsers reject none+insecure combos.
  const cookieOpts = { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax" };
  res.cookie("accessToken", accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 * 1000 });
}

// POST /api/auth/signup
router.post("/signup", authLimiter, async (req, res) => {
  try {
    const { email, username, password, displayName, guestSessionId } = req.body;
    if (!email || !username || !password || !displayName) {
      return res.status(400).json({ error: "email, username, password, displayName are required" });
    }
    if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(username)) {
      return res.status(400).json({ error: "Username must be 3-20 characters: letters, numbers, underscores, periods, or hyphens only" });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? "Email" : "Username";
      return res.status(409).json({ error: `${field} already in use` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(24).toString("hex");
    const user = await User.create({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      passwordHash,
      displayName,
      verificationToken,
      guestSessionId,
    });

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (mailErr) {
      console.error("[auth] failed to send verification email:", mailErr.message);
      console.log(`[auth] fallback verify link: ${process.env.CLIENT_URL}/verify?token=${verificationToken}`);
    }

    res.status(201).json({ message: "Account created. Check email to verify and claim sign-up coins." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/resend-verification
router.post("/resend-verification", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    // Same response whether the account exists or not — avoids leaking which emails are registered
    if (!user || user.isVerified) {
      return res.json({ message: "If that account needs verifying, a new email has been sent." });
    }

    const verificationToken = crypto.randomBytes(24).toString("hex");
    user.verificationToken = verificationToken;
    await user.save();

    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (mailErr) {
      console.error("[auth] resend failed:", mailErr.message);
      console.log(`[auth] fallback verify link: ${process.env.CLIENT_URL}/verify?token=${verificationToken}`);
    }

    res.json({ message: "If that account needs verifying, a new email has been sent." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/verify?token=...
router.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ error: "Invalid or expired verification token" });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    if (user.guestSessionId) {
      await Engagement.updateMany(
        { sessionId: user.guestSessionId },
        { $set: { userId: user._id }, $unset: { sessionId: "" } }
      );
    }

    // Award one-time sign-up coins (idempotent: only if no prior signup engagement exists)
    const anyProduct = await Product.findOne();
    const already = await Engagement.findOne({ userId: user._id, type: "signup" });
    if (!already && anyProduct) {
      const engagement = await Engagement.create({
        userId: user._id,
        productId: anyProduct._id,
        type: "signup",
        coinsAwarded: 25,
      });
      await applyCoinDelta({ userId: user._id, delta: 25, reason: "engagement:signup", refId: engagement._id });
    }

    issueTokens(res, user);
    res.json({ message: "Email verified", user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login — accepts either email or username as "identifier"
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: "identifier and password are required" });
    }
    const lower = identifier.toLowerCase();
    const user = await User.findOne({ $or: [{ email: lower }, { username: lower }] });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (user.isSuspended) return res.status(403).json({ error: "Account suspended" });
    if (!user.isVerified) return res.status(403).json({ error: "Please verify your email before logging in" });

    issueTokens(res, user);
    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        coinBalance: user.coinBalance,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: "No refresh token" });
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "Invalid session" });
    issueTokens(res, user);
    res.json({ ok: true });
  } catch {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  const cookieOpts = { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax" };
  res.clearCookie("accessToken", cookieOpts);
  res.clearCookie("refreshToken", cookieOpts);
  res.json({ ok: true });
});

export default router;