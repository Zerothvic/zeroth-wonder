import { generateText, generateImage } from "../services/aiGateway.js";
import { composePagesToPDF } from "../services/pdfCompose.js";
import { uploadBufferToCloudinary } from "../services/storage.js";

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

  const pdf = await composePagesToPDF(pageImages, { watermark: "Zeroth Wonder" });
  const { url, publicId, resourceType } = await uploadBufferToCloudinary(pdf, "zeroth-wonder/comics", "auto");

  return { assetUrl: url, publicId, resourceType, provider };
}