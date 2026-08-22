

import { InferenceClient } from "@huggingface/inference";

const TEXT_PROVIDERS = ["gemini", "groq"];
const IMAGE_PROVIDERS = ["huggingface-flux", "gemini-image"];
const TTS_MODELS = ["hexgrad/Kokoro-82M", "ResembleAI/chatterbox"];

async function callWithFallback(providers, fn) {
  let lastErr;
  for (const provider of providers) {
    try {
      return { provider, result: await fn(provider) };
    } catch (err) {
      lastErr = err;
      console.warn(`[aiGateway] ${provider} failed, trying next:`, err.message);
    }
  }
  throw lastErr;
}

export async function generateText(prompt, { system } = {}) {
  return callWithFallback(TEXT_PROVIDERS, async (provider) => {
    if (provider === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: system ? `${system}\n\n${prompt}` : prompt }] }],
          }),
        }
      );
      if (!res.ok) throw new Error(`Gemini text ${res.status}`);
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }
    if (provider === "groq") {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            ...(system ? [{ role: "system", content: system }] : []),
            { role: "user", content: prompt },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Groq text ${res.status}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? "";
    }
    throw new Error(`Unknown text provider: ${provider}`);
  });
}

export async function generateImage(prompt) {
  return callWithFallback(IMAGE_PROVIDERS, async (provider) => {
    if (provider === "huggingface-flux") {
      const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
      const image = await client.textToImage({
        provider: "auto",
        model: "black-forest-labs/FLUX.1-schnell",
        inputs: prompt,
      });
      const arrayBuffer = await image.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
    if (provider === "gemini-image") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["IMAGE"] },
          }),
        }
      );
      if (!res.ok) throw new Error(`Gemini image ${res.status}`);
      const data = await res.json();
      const b64 = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
      if (!b64) throw new Error("No image returned");
      return Buffer.from(b64, "base64");
    }
    throw new Error(`Unknown image provider: ${provider}`);
  });
}

export async function generateInstrumental(prompt) {
  const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
  const audio = await client.textToSpeech({
    provider: "auto",
    model: "facebook/musicgen-small",
    inputs: prompt,
  });
  const arrayBuffer = await audio.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Stub — wire up a free TTS provider here (rotates often, see PRD 11).
export async function generateSpeech(text) {
  const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
  let lastErr;
  for (const model of TTS_MODELS) {
    try {
      const audio = await client.textToSpeech({ provider: "auto", model, inputs: text });
      const arrayBuffer = await audio.arrayBuffer();
      return { provider: `huggingface:${model}`, result: Buffer.from(arrayBuffer) };
    } catch (err) {
      lastErr = err;
      console.warn(`[aiGateway] TTS model ${model} failed, trying next:`, err.message);
    }
  }
  throw lastErr;
}