/**
 * AI Gateway — bottleneck 12.2 solution.
 * Every provider call in the app goes through here, never directly from a
 * worker/controller. When a free-tier is throttled or a provider is swapped,
 * you change ONE file, not every worker.
 *
 * MVP note: fill in the fetch calls with whichever free-tier providers you've
 * signed up for (see PRD Section 11). Each capability lists a primary + a
 * fallback so a single exhausted quota doesn't take down that product type.
 */

const TEXT_PROVIDERS = ["gemini", "groq"];
const IMAGE_PROVIDERS = ["gemini-image", "huggingface-flux"];

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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
          model: "llama-3.3-70b-versatile",
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
    if (provider === "gemini-image") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      if (!res.ok) throw new Error(`Gemini image ${res.status}`);
      const data = await res.json();
      const b64 = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
      if (!b64) throw new Error("No image returned");
      return Buffer.from(b64, "base64");
    }
    if (provider === "huggingface-flux") {
      const res = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt }),
        }
      );
      if (!res.ok) throw new Error(`HF image ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    }
    throw new Error(`Unknown image provider: ${provider}`);
  });
}

// Stub — wire up a free TTS provider here (rotates often, see PRD 11).
export async function generateSpeech(text) {
  throw new Error("TODO: wire a free TTS provider in aiGateway.generateSpeech()");
}