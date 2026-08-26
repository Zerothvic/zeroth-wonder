import Engagement from "../models/Engagement.js";
import UnlockRule from "../models/UnlockRule.js";

const COMMENT_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generic rule evaluator shared by ALL five products (bottleneck 12.9).
 * Admin edits thresholds in the UnlockRule collection; this function never
 * needs to change when the economy is tuned.
 */
export async function getUnlockProgress(userIdOrSessionId, isUser, productId) {
  const rule = await UnlockRule.findOne({ productId });
  if (!rule) throw new Error("No unlock rule configured for this product");

  const identityFilter = isUser ? { userId: userIdOrSessionId } : { sessionId: userIdOrSessionId };
  const validCommentSince = new Date(Date.now() - COMMENT_EXPIRATION_MS);

  const [likeCount, activeCommentCount, signupCount, sharePlatforms] = await Promise.all([
    Engagement.countDocuments({ ...identityFilter, type: "like" }),
    // Only count comments posted within the last 24 hours toward unlocking
    Engagement.countDocuments({
      ...identityFilter,
      type: "comment",
      createdAt: { $gte: validCommentSince },
    }),
    isUser ? Engagement.countDocuments({ userId: userIdOrSessionId, type: "signup" }) : 0,
    Engagement.distinct("platform", { ...identityFilter, type: "share", productId }),
  ]);

  const progress = {
    likes: { have: likeCount, need: rule.requiresLikes, met: likeCount >= rule.requiresLikes },
    comments: {
      have: activeCommentCount,
      need: rule.requiresComments ? 1 : 0,
      met: !rule.requiresComments || activeCommentCount >= 1,
    },
    signup: { have: signupCount, need: rule.requiresSignup ? 1 : 0, met: !rule.requiresSignup || signupCount >= 1 },
    shares: {
      have: sharePlatforms.filter(Boolean).length,
      need: rule.requiresSharePlatforms,
      met: sharePlatforms.filter(Boolean).length >= rule.requiresSharePlatforms,
    },
  };

  const unlocked = Object.values(progress).every((p) => p.met);
  return { unlocked, progress };
}
