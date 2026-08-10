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
 * Includes the user's original prompt as a small caption near the top,
 * so the shareable image gives context on what it was generated from.
 */
async function renderTextCardPNG({
  title,
  prompt,
  bodyText,
  gradientFrom = "#EDC45A",
  gradientTo = "#ED802A",
}) {
  const width = 1080;
  const height = 1350;

  const promptLines = wrapText(`"${prompt}"`, 55);
  const bodyLines = wrapText(bodyText, 40);

  const titleY = 130;
  const promptStartY = 200;
  const promptLineHeight = 34;
  const bodyStartY = promptStartY + promptLines.length * promptLineHeight + 70;
  const bodyLineHeight = 48;

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

      <text font-family="Arial, sans-serif" font-size="26" font-style="italic" fill="#2B2118" opacity="0.75" text-anchor="middle">
        ${promptTspans}
      </text>

      <text font-family="Georgia, serif" font-size="32" font-weight="bold" fill="#2B2118" text-anchor="middle">
        ${bodyTspans}
      </text>

      <text x="${width / 2}" y="${height - 50}" font-family="Arial, sans-serif" font-size="24"
            fill="#F2E2CF" text-anchor="middle" opacity="0.85">
        Zeroth Wonder
      </text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function renderFortunePNG(prompt, fortuneText) {
  return renderTextCardPNG({
    title: "Your Fortune",
    prompt,
    bodyText: fortuneText,
    gradientFrom: "#EDC45A",
    gradientTo: "#ED802A",
  });
}

export async function renderConversationPNG(prompt, excerptText) {
  return renderTextCardPNG({
    title: "A Conversation",
    prompt,
    bodyText: excerptText,
    gradientFrom: "#65BCB5",
    gradientTo: "#2B2118",
  });
}