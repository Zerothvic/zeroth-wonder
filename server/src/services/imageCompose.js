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
 * Fortune card — single-color body text, dynamic height. Unchanged from
 * before; only used by renderFortunePNG.
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
  const usableWidth = width - sideMargin * 2;

  const promptFontSize = 28;
  const promptLineHeight = 38;
  const promptCharsPerLine = Math.floor(usableWidth / (promptFontSize * 0.52));

  const bodyFontSize = 34;
  const bodyLineHeight = 50;
  const bodyCharsPerLine = Math.floor(usableWidth / (bodyFontSize * 0.55));

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

  const footerGap = 90;
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

/**
 * Conversation card — chat-bubble style. Each line of the AI's alternating
 * exchange becomes its own bubble: even-indexed lines (the present self) are
 * black bubbles with white text, aligned right; odd-indexed lines (the past
 * or future self) are white/cream bubbles with black text, aligned left.
 * Solid bubble backgrounds guarantee contrast regardless of where a bubble
 * lands on the underlying gradient.
 */
export async function renderConversationPNG(promptSummary, excerptText) {
  const width = 1080;
  const canvasPadding = 70;
  const bubbleMaxWidth = 760;
  const bubbleFontSize = 30;
  const bubbleLineHeight = 40;
  const bubblePaddingX = 28;
  const bubblePaddingY = 18;
  const bubbleGap = 26;
  const bubbleCharsPerLine = Math.floor((bubbleMaxWidth - bubblePaddingX * 2) / (bubbleFontSize * 0.55));

  const turns = excerptText
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

  const promptFontSize = 26;
  const promptLineHeight = 36;
  const usableWidth = width - canvasPadding * 2;
  const promptCharsPerLine = Math.floor(usableWidth / (promptFontSize * 0.52));
  const hasPrompt = !!promptSummary?.trim();
  const promptLines = hasPrompt ? wrapText(`"${promptSummary.trim()}"`, promptCharsPerLine) : [];

  const titleY = 100;
  const promptStartY = titleY + 80;
  const promptBlockHeight = promptLines.length * promptLineHeight;
  let cursorY = hasPrompt ? promptStartY + promptBlockHeight + 55 : titleY + 90;

  const promptTspans = promptLines
    .map((line, i) => `<tspan x="${width / 2}" y="${promptStartY + i * promptLineHeight}">${escapeXml(line)}</tspan>`)
    .join("");

  const bubbles = turns.map((turn, i) => {
    const isPresent = i % 2 === 0;
    const lines = wrapText(turn, bubbleCharsPerLine);
    const longestLine = lines.reduce((a, b) => (b.length > a.length ? b : a), "");
    const contentWidth = Math.min(
      bubbleMaxWidth - bubblePaddingX * 2,
      Math.max(140, Math.round(longestLine.length * bubbleFontSize * 0.55))
    );
    const bubbleWidth = contentWidth + bubblePaddingX * 2;
    const bubbleHeight = lines.length * bubbleLineHeight + bubblePaddingY * 2;

    const bubbleX = isPresent ? width - canvasPadding - bubbleWidth : canvasPadding;
    const bubbleY = cursorY;
    const textCenterX = bubbleX + bubbleWidth / 2;
    const firstLineY = bubbleY + bubblePaddingY + bubbleFontSize * 0.78;

    const tspans = lines
      .map((line, li) => `<tspan x="${textCenterX}" y="${firstLineY + li * bubbleLineHeight}">${escapeXml(line)}</tspan>`)
      .join("");

    const fill = isPresent ? "#2B2118" : "#F2E2CF";
    const textColor = isPresent ? "#F2E2CF" : "#2B2118";

    cursorY += bubbleHeight + bubbleGap;

    return `
      <rect x="${bubbleX}" y="${bubbleY}" width="${bubbleWidth}" height="${bubbleHeight}" rx="20"
            fill="${fill}" opacity="0.95" />
      <text font-family="Arial, sans-serif" font-size="${bubbleFontSize}" font-weight="600"
            fill="${textColor}" text-anchor="middle">
        ${tspans}
      </text>
    `;
  });

  const footerGap = 80;
  const footerY = cursorY - bubbleGap + footerGap;
  const bottomPadding = 60;
  const height = Math.min(2800, Math.max(1000, footerY + bottomPadding));

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#65BCB5" />
          <stop offset="100%" stop-color="#2B2118" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />

      <text x="${width / 2}" y="${titleY}" font-family="Georgia, serif" font-size="46" font-weight="bold"
            fill="#F2E2CF" text-anchor="middle">
        A Conversation
      </text>

      ${hasPrompt ? `
      <text font-family="Arial, sans-serif" font-size="${promptFontSize}" font-style="italic" fill="#F2E2CF" opacity="0.8" text-anchor="middle">
        ${promptTspans}
      </text>` : ""}

      ${bubbles.join("\n")}

      <text x="${width / 2}" y="${height - 40}" font-family="Arial, sans-serif" font-size="24"
            fill="#F2E2CF" text-anchor="middle" opacity="0.75">
        Zeroth Wonder
      </text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}