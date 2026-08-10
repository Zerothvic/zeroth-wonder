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

export async function renderFortunePNG(text) {
  const width = 1080;
  const height = 1350;
  const lines = wrapText(text, 40);
  const lineHeight = 48;
  const startY = height / 2 - (lines.length * lineHeight) / 2;

  const tspans = lines
    .map((line, i) => `<tspan x="${width / 2}" y="${startY + i * lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#EDC45A" />
          <stop offset="100%" stop-color="#ED802A" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)" />
      <text font-family="Georgia, serif" font-size="34" font-weight="bold" fill="#2B2118" text-anchor="middle">
        ${tspans}
      </text>
      <text x="${width / 2}" y="${height - 50}" font-family="Arial, sans-serif" font-size="24"
            fill="#F2E2CF" text-anchor="middle" opacity="0.85">
        Zeroth Wonder
      </text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}