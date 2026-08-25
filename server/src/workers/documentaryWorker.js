import { generateText, generateImage, generateSpeech } from "../services/aiGateway.js";
import { composeVideoFfmpeg } from "../services/videoCompose.js";
import { uploadBufferToCloudinary } from "../services/storage.js";

export async function runDocumentaryJob(genJob) {
  const { provider, result: scriptRaw } = await generateText(
    `Write a 2-minute documentary narration script (exactly 5-6 short scene beats, one per line) about: "${genJob.prompt}". Warm, cinematic, third-person.`
  );
  const scenes = scriptRaw.split("\n").filter(Boolean).slice(0, 6);

  const sceneImages = [];
  for (const scene of scenes) {
    const { result: imageBuffer } = await generateImage(`Cartoon documentary still, cinematic lighting: ${scene}`);
    sceneImages.push(imageBuffer);
  }

  const { result: narrationBuffer } = await generateSpeech(scenes.join(". "));

  const videoBuffer = await composeVideoFfmpeg({ sceneImages, captions: scenes, narrationBuffer });
  const { url, publicId, resourceType } = await uploadBufferToCloudinary(videoBuffer, "zeroth-wonder/documentaries", "video");

  return { assetUrl: url, publicId, resourceType, provider };
}