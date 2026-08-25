import { InferenceClient } from "@huggingface/inference";

const IMAGE_PROVIDERS = ["huggingface-flux", "gemini-image", "cloudflare-image"];
const TTS_PROVIDERS = ["huggingface-kokoro", "huggingface-chatterbox", "cloudflare-melotts"];
const TEXT_FALLBACK_MODEL = "deepseek-ai/DeepSeek-V4-Flash-0731";

const CF_BASE = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run`;
function cfHeaders() {
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

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

// ---------- TEXT ----------

async function generateTextGemini(prompt, system) {
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
  if (!res.ok) throw new Error(`Gemini text ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const candidate = data.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== "STOP") {
    throw new Error(`Gemini text blocked: finishReason=${candidate.finishReason}`);
  }
  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini text: empty response");
  return text;
}

async function generateTextHuggingFace(prompt, system) {
  const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
  const completion = await client.chatCompletion({
    provider: "auto",
    model: TEXT_FALLBACK_MODEL,
    messages: [
      ...(system ? [{ role: "system", content: system }] : []),
      { role: "user", content: prompt },
    ],
  });
  const text = completion.choices?.[0]?.message?.content;
  if (!text) throw new Error("Hugging Face text: empty response");
  return text;
}

async function generateTextCloudflare(prompt, system) {
  const res = await fetch(`${CF_BASE}/@cf/meta/llama-3.1-8b-instruct`, {
    method: "POST",
    headers: cfHeaders(),
    body: JSON.stringify({
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Cloudflare text ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.result?.response;
  if (!text) throw new Error("Cloudflare text: empty response");
  return text;
}

export async function generateText(prompt, { system } = {}) {
  return callWithFallback(["gemini", "huggingface", "cloudflare"], async (provider) => {
    if (provider === "gemini") return generateTextGemini(prompt, system);
    if (provider === "huggingface") return generateTextHuggingFace(prompt, system);
    if (provider === "cloudflare") return generateTextCloudflare(prompt, system);
    throw new Error(`Unknown text provider: ${provider}`);
  });
}

// ---------- IMAGE ----------

export async function generateImage(prompt) {
  return callWithFallback(IMAGE_PROVIDERS, async (provider) => {
    if (provider === "huggingface-flux") {
      const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
      const image = await client.textToImage({
        provider: "auto",
        model: "black-forest-labs/FLUX.1-schnell",
        inputs: prompt,
      });
      return Buffer.from(await image.arrayBuffer());
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
    if (provider === "cloudflare-image") {
      const res = await fetch(`${CF_BASE}/@cf/black-forest-labs/flux-1-schnell`, {
        method: "POST",
        headers: cfHeaders(),
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`Cloudflare image ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const b64 = data.result?.image;
      if (!b64) throw new Error("Cloudflare image: empty response");
      return Buffer.from(b64, "base64");
    }
    throw new Error(`Unknown image provider: ${provider}`);
  });
}

// ---------- SPEECH ----------

export async function generateSpeech(text) {
  return callWithFallback(TTS_PROVIDERS, async (provider) => {
    if (provider === "huggingface-kokoro" || provider === "huggingface-chatterbox") {
      const model = provider === "huggingface-kokoro" ? "hexgrad/Kokoro-82M" : "ResembleAI/chatterbox";
      const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
      const audio = await client.textToSpeech({ provider: "auto", model, inputs: text });
      return Buffer.from(await audio.arrayBuffer());
    }
    if (provider === "cloudflare-melotts") {
      const res = await fetch(`${CF_BASE}/@cf/myshell-ai/melotts`, {
        method: "POST",
        headers: cfHeaders(),
        body: JSON.stringify({ prompt: text, lang: "en" }),
      });
      if (!res.ok) throw new Error(`Cloudflare TTS ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const b64 = data.result?.audio;
      if (!b64) throw new Error("Cloudflare TTS: empty response");
      return Buffer.from(b64, "base64");
    }
    throw new Error(`Unknown TTS provider: ${provider}`);
  });
}

// ---------- INSTRUMENTAL (Hugging Face only — no equivalent elsewhere yet) ----------

export async function generateInstrumental(prompt) {
  const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
  const audio = await client.textToSpeech({
    provider: "auto",
    model: "facebook/musicgen-small",
    inputs: prompt,
  });
  return Buffer.from(await audio.arrayBuffer());
}