import "dotenv/config";

const res = await fetch(
  "https://huggingface.co/api/models?pipeline_tag=text-to-speech&expand[]=inferenceProviderMapping&limit=30",
  { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
);
const models = await res.json();

const withProviders = models.filter(
  (m) => m.inferenceProviderMapping && Object.keys(m.inferenceProviderMapping).length > 0
);

console.log(`Found ${withProviders.length} TTS models with at least one active provider:\n`);
withProviders.forEach((m) => {
  console.log(m.id, "→", Object.keys(m.inferenceProviderMapping).join(", "));
});