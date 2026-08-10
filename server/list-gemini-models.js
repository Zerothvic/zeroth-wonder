import "dotenv/config";

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
);
const data = await res.json();

const usable = (data.models || []).filter((m) =>
  m.supportedGenerationMethods?.includes("generateContent")
);

console.log("Models your key can call with generateContent:");
usable.forEach((m) => console.log(" -", m.name));