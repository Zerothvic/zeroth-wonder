import rateLimit from "express-rate-limit";

// Bottleneck 12.5: caps brute-force / bot-driven engagement spam per IP.
export const engagementLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // max 20 engagement actions/minute/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many actions — slow down and try again shortly." },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});