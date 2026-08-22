import sharp from "sharp";

function wrapText(text, maxCharsPerLine) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length > maxCharsPerLine) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generic branded card renderer, reused by Fortune and Conversation.
 * Height is calculated from actual content length so nothing gets cropped
 * or overlaps the watermark — short answers get a compact card, long ones
 * get a taller one. Text uses a wide, centered column instead of leaving
 * the sides empty.
 */
async function renderTextCardPNG({
  title,
  promptSummary,
  bodyText,
  gradientFrom = "#EDC45A",
  gradientTo = "#ED802A",
}) {
  const width = 1080;
  const sideMargin = 90;
  const usableWidth = width - sideMargin * 2; // 900px — actually used now, not left empty

  const promptFontSize = 28;
  const promptLineHeight = 38;
  const promptCharsPerLine = Math.floor(usableWidth / (promptFontSize * 0.52)); // ~62

  const bodyFontSize = 34;
  const bodyLineHeight = 50;
  const bodyCharsPerLine = Math.floor(usableWidth / (bodyFontSize * 0.55)); // ~48

  const hasPrompt = !!promptSummary?.trim();
  const promptLines = hasPrompt ? wrapText(`"${promptSummary.trim()}"`, promptCharsPerLine) : [];
  const bodyLines = wrapText(bodyText.trim(), bodyCharsPerLine);

  const titleY = 110;
  const promptStartY = titleY + 90;
  const promptBlockHeight = promptLines.length * promptLineHeight;
  const gapAfterPrompt = hasPrompt ? 60 : 0;

  const bodyStartY = hasPrompt
    ? promptStartY + promptBlockHeight + gapAfterPrompt
    : titleY + 100;
  const bodyBlockHeight = bodyLines.length * bodyLineHeight;
  const bodyEndY = bodyStartY + bodyBlockHeight;

  const footerGap = 90; // guaranteed clearance between last line of body text and the watermark
  const footerY = bodyEndY + footerGap;
  const bottomPadding = 60;

  const height = Math.min(2600, Math.max(1000, footerY + bottomPadding));

  const promptTspans = promptLines
    .map((line, i) => `<tspan x="${width / 2}" y="${promptStartY + i * promptLineHeight}">${escapeXml(line)}</tspan>`)
    .join("");

  const bodyTspans = bodyLines
    .map((line, i) => `<tspan x="${width / 2}" y="${bodyStartY + i * bodyLineHeight}">${escapeXml(line)}</tspan>`)
    .join("");

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${gradientFrom}" />
          <stop offset="100%" stop-color="${gradientTo}" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />

      <text x="${width / 2}" y="${titleY}" font-family="Georgia, serif" font-size="46" font-weight="bold"
            fill="#2B2118" text-anchor="middle">
        ${escapeXml(title)}
      </text>

      ${hasPrompt ? `
      <text font-family="Arial, sans-serif" font-size="${promptFontSize}" font-style="italic" fill="#2B2118" opacity="0.75" text-anchor="middle">
        ${promptTspans}
      </text>` : ""}

      <text font-family="Georgia, serif" font-size="${bodyFontSize}" font-weight="bold" fill="#2B2118" text-anchor="middle">
        ${bodyTspans}
      </text>

      <text x="${width / 2}" y="${height - 40}" font-family="Arial, sans-serif" font-size="24"
            fill="#F2E2CF" text-anchor="middle" opacity="0.85">
        Zeroth Wonder
      </text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function renderFortunePNG(promptSummary, fortuneText) {
  return renderTextCardPNG({
    title: "Your Fortune",
    promptSummary,
    bodyText: fortuneText,
    gradientFrom: "#EDC45A",
    gradientTo: "#ED802A",
  });
}

export async function renderConversationPNG(promptSummary, excerptText) {
  return renderTextCardPNG({
    title: "A Conversation",
    promptSummary,
    bodyText: excerptText,
    gradientFrom: "#65BCB5",
    gradientTo: "#2B2118",
  });
}