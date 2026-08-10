import "dotenv/config";
import { generateText, generateImage } from "./src/services/aiGateway.js";

async function testText() {
  console.log("\n--- Testing generateText ---");
  try {
    const { provider, result } = await generateText("Say hello in exactly 5 words.");
    console.log(`✅ Text OK via ${provider}:`, result);
  } catch (err) {
    console.error("❌ Text failed on all providers:", err.message);
  }
}

async function testImage() {
  console.log("\n--- Testing generateImage ---");
  try {
    const { provider, result } = await generateImage("A simple orange circle on a white background");
    console.log(`✅ Image OK via ${provider}, buffer size: ${result.length} bytes`);
  } catch (err) {
    console.error("❌ Image failed on all providers:", err.message);
  }
}

await testText();
await testImage();