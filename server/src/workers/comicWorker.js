import { generateText, generateImage } from "../services/aiGateway.js";
import { composePagesToPDF } from "../services/pdfCompose.js";
import { uploadBufferToCloudinary } from "../services/storage.js";
import { overlayComicDialogue } from "../services/imageCompose.js";

export async function runComicJob(genJob) {
  const prompt = `
You are a comic writer. Create a 5-panel comic story based on: "${genJob.prompt}".
Return ONLY a valid JSON array of 5 objects with no extra formatting or backticks:
[
  {
    "imagePrompt": "visual description of the scene without text",
    "dialogue": "dialogue or caption line for this panel"
  }
]
`;

  const { provider, result: scriptRaw } = await generateText(prompt);
  
  let panels = [];
  try {
    const cleaned = scriptRaw.replace(/```json/g, "").replace(/```/g, "").trim();
    panels = JSON.parse(cleaned);
  } catch (err) {
    // Fallback parsing if LLM outputs plaintext lines
    panels = scriptRaw.split("\n").filter(Boolean).slice(0, 5).map((line) => ({
      imagePrompt: line,
      dialogue: line,
    }));
  }

  const compositedPanels = [];

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    const { result: rawImageBuffer } = await generateImage(
      `Minimalist colorful comic panel, graphic novel style, clean linework, no written text: ${panel.imagePrompt}`
    );

    const finalizedPanel = await overlayComicDialogue(
      rawImageBuffer,
      panel.dialogue,
      i + 1
    );

    compositedPanels.push(finalizedPanel);
  }

  const pdf = await composePagesToPDF(compositedPanels, { watermark: "Zeroth Wonder" });
  const { url, publicId, resourceType } = await uploadBufferToCloudinary(
    pdf,
    "zeroth-wonder/comics",
    "auto"
  );

  return { assetUrl: url, publicId, resourceType, provider };
}

