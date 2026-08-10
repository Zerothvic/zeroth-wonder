import { generateText } from "../services/aiGateway.js";
import { renderFortunePNG } from "../services/imageCompose.js";
import { uploadBufferToCloudinary } from "../services/storage.js";

export async function runFortuneJob(genJob) {
  const { provider, result: fortuneText } = await generateText(
    `Write a 150-word funny, chaotic fortune-teller reading based on: "${genJob.prompt}". Weird, playful, upbeat tone.`,
    { system: "You are a chaotic carnival fortune teller. Never mention real people." }
  );

  const png = await renderFortunePNG(fortuneText);
  const assetUrl = await uploadBufferToCloudinary(png, "zeroth-wonder/fortunes", "image");

  return { assetUrl, provider };
}