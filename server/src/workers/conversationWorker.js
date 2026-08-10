import { generateText } from "../services/aiGateway.js";
import { renderConversationPNG } from "../services/imageCompose.js";
import { uploadBufferToCloudinary } from "../services/storage.js";

export async function runConversationJob(genJob) {
  const { provider, result: excerpt } = await generateText(
    `Write a short, moving 5-line imagined exchange between someone and their past or future self, based on: "${genJob.prompt}". Format as alternating short lines, no names, warm and reflective tone.`,
    { system: "You write brief, emotionally resonant imagined dialogue. Never reference real, identifiable people." }
  );

  const png = await renderConversationPNG(genJob.prompt, excerpt);
  const { url, publicId, resourceType } = await uploadBufferToCloudinary(png, "zeroth-wonder/conversations", "image");

  return { assetUrl: url, publicId, resourceType, provider };
}