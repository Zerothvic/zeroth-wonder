import { generateText, generateImage } from "../services/aiGateway.js";
// import { generateSpeech } from "../services/aiGateway.js";
// import { composeVideoFfmpeg } from "../services/videoCompose.js"; // ffmpeg Ken-Burns pipeline

export async function runDocumentaryJob(genJob) {
  const { provider, result: scriptRaw } = await generateText(
    `Write a 2-minute documentary narration script (8-12 short scene beats) about: "${genJob.prompt}". Warm, cinematic, third-person.`
  );
  const scenes = scriptRaw.split("\n").filter(Boolean).slice(0, 12);

  const sceneImages = [];
  for (const scene of scenes) {
    const { result: imageBuffer } = await generateImage(`Cartoon documentary still, cinematic lighting: ${scene}`);
    sceneImages.push(imageBuffer);
  }

  // TODO: generateSpeech(scriptRaw) for narration, then ffmpeg:
  // pan/zoom each sceneImage (Ken Burns), overlay captions, sync to narration -> mp4, upload.
  const assetUrl = `https://placeholder.zerothwonder.app/documentaries/${genJob._id}.mp4`;
  return { assetUrl, provider };
}