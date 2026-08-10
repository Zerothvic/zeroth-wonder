import { generateText, generateSpeech, generateInstrumental } from "../services/aiGateway.js";
import { composeSongMp3 } from "../services/audioCompose.js";
import { uploadBufferToCloudinary } from "../services/storage.js";

export async function runSongJob(genJob) {
  const { provider, result: lyrics } = await generateText(
    `Write short, rhythmic, rap-style spoken lyrics (about 15-20 seconds when read aloud) about: "${genJob.prompt}". Fun, punchy, no singing notation.`
  );

  const { result: introBuffer } = await generateSpeech("Zeroth Wonder presents...");
  const { result: vocalBuffer } = await generateSpeech(lyrics);

  let instrumentalBuffer = null;
  try {
    instrumentalBuffer = await generateInstrumental(`Upbeat instrumental backing track, no vocals, theme: ${genJob.prompt}`);
  } catch (err) {
    console.warn("[songWorker] instrumental generation failed, shipping vocal-only:", err.message);
  }

  const mp3 = await composeSongMp3({ introBuffer, vocalBuffer, instrumentalBuffer });
  const { url, publicId, resourceType } = await uploadBufferToCloudinary(mp3, "zeroth-wonder/songs", "video");

  return { assetUrl: url, publicId, resourceType, provider };
}