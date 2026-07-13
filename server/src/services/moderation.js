// Bottleneck 12.7: lightweight pre-check before a prompt reaches any AI
// provider or the moderation queue. Not a full trust/safety system —
// enough to catch obvious abuse for an MVP and log the rest for admin review.

const BLOCKED_PATTERNS = [
  /\b(kill|suicide|self[- ]harm)\b/i,
  /\bnon[- ]?consensual\b/i,
  // extend with a real moderation-list / provider moderation endpoint before launch
];

export function precheckPrompt(prompt) {
  if (!prompt || prompt.trim().length < 3) {
    return { allowed: false, reason: "Prompt too short" };
  }
  if (prompt.length > 1000) {
    return { allowed: false, reason: "Prompt too long" };
  }
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(prompt)) {
      return { allowed: false, reason: "Prompt flagged by content policy", needsReview: true };
    }
  }
  return { allowed: true };
}