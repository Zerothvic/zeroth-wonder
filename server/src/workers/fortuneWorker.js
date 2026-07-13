import { generateText } from "../services/aiGateway.js";
// import { renderTextOnTemplatePNG } from "../services/imageCompose.js"; // implement with sharp/canvas
// import { uploadToStorage } from "../services/storage.js"; // implement with Cloudinary SDK

export async function runFortuneJob(genJob) {
  const { provider, result: fortuneText } = await generateText(
    `Write a 150-word funny, chaotic fortune-teller reading based on: "${genJob.prompt}". Weird, playful, upbeat tone.`,
    { system: "You are a chaotic carnival fortune teller. Never mention real people." }
  );

  // TODO: render fortuneText onto the branded PNG template (sharp/canvas),
  // add the "Zeroth Wonder" watermark at the bottom, then upload and get a URL.
  const assetUrl = `https://placeholder.zerothwonder.app/fortunes/${genJob._id}.png`; // replace once storage is wired
  return { assetUrl, provider };
}