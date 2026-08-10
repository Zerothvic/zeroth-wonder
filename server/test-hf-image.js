import "dotenv/config";
import { InferenceClient } from "@huggingface/inference";

console.log("Token present:", !!process.env.HUGGINGFACE_API_KEY);
console.log("Token length:", process.env.HUGGINGFACE_API_KEY?.length);

try {
  const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
  const image = await client.textToImage({
    provider: "auto",
    model: "black-forest-labs/FLUX.1-schnell",
    inputs: "a simple orange circle on a white background",
  });
  console.log("✅ Success, blob size:", (await image.arrayBuffer()).byteLength);
} catch (err) {
  console.error("❌ Failed");
  console.error("Message:", err.message);
  console.error("Cause:", err.cause);
  console.error("Full error:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
}