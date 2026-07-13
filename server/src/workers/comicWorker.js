import { generateText, generateImage } from "../services/aiGateway.js";
// import { composePagesToPDF } from "../services/pdfCompose.js"; // implement with pdf-lib
// import { uploadToStorage } from "../services/storage.js";

export async function runComicJob(genJob) {
  const { provider, result: scriptRaw } = await generateText(
    `Write a 5-beat comic script (one line per page) about: "${genJob.prompt}". Minimalist, colorful, life-story tone. Return exactly 5 lines.`
  );
  const beats = scriptRaw.split("\n").filter(Boolean).slice(0, 5);

  const pageImages = [];
  for (const beat of beats) {
    const { result: imageBuffer } = await generateImage(
      `Minimalist colorful comic panel, consistent character design, no text: ${beat}`
    );
    pageImages.push(imageBuffer);
  }

  // TODO: composite pageImages into a 5-page PDF with pdf-lib, stamping the
  // "Zeroth Wonder" watermark on each page footer, then upload.
  const assetUrl = `https://placeholder.zerothwonder.app/comics/${genJob._id}.pdf`;
  return { assetUrl, provider };
}