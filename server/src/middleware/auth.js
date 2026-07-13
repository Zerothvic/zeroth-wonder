import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Required auth: rejects if no valid access token.
export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || user.isSuspended) return res.status(401).json({ error: "Not authenticated" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Optional auth: attaches req.user if present, but never blocks (guests allowed).
export async function optionalAuth(req, res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = await User.findById(payload.sub);
    }
  } catch {
    // ignore bad/expired token for optional auth
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ error: "Admin access required" });
  next();
}