import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";

const run = promisify(execFile);

function escapeDrawtext(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/%/g, "\\%");
}

async function getAudioDuration(filePath) {
  const { stdout } = await run(ffprobePath.path, [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  return parseFloat(stdout.trim());
}

/**
 * Composites scene images + captions + a single narration track into an MP4.
 * Each scene gets a Ken-Burns zoom + its caption burned in, scenes are
 * concatenated, then the narration audio is laid over the whole thing.
 */
export async function composeVideoFfmpeg({ sceneImages, captions, narrationBuffer }) {
  const workDir = path.join(os.tmpdir(), `zw-doc-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await fs.mkdir(workDir, { recursive: true });

  try {
    const narrationPath = path.join(workDir, "narration.mp3");
    await fs.writeFile(narrationPath, narrationBuffer);
    const totalDuration = await getAudioDuration(narrationPath);

    const perScene = Math.max(3, Math.min(20, totalDuration / sceneImages.length));
    const fps = 25;
    const frames = Math.round(perScene * fps);

    const clipPaths = [];
    for (let i = 0; i < sceneImages.length; i++) {
      const imgPath = path.join(workDir, `scene-${i}.png`);
      await fs.writeFile(imgPath, sceneImages[i]);

      const caption = escapeDrawtext(captions[i] || "");
      const clipPath = path.join(workDir, `clip-${i}.mp4`);

      const filter =
        `zoompan=z='min(zoom+0.0015,1.2)':d=${frames}:s=1280x720:fps=${fps},` +
        `drawtext=text='${caption}':fontcolor=white:fontsize=32:` +
        `x=(w-text_w)/2:y=h-90:box=1:boxcolor=black@0.55:boxborderw=12`;

      await run(ffmpegPath, [
        "-y", "-loop", "1", "-i", imgPath,
        "-vf", filter,
        "-t", String(perScene),
        "-r", String(fps),
        "-pix_fmt", "yuv420p",
        clipPath,
      ]);
      clipPaths.push(clipPath);
    }

    const listPath = path.join(workDir, "concat-list.txt");
    await fs.writeFile(listPath, clipPaths.map((p) => `file '${p}'`).join("\n"));

    const concatenatedPath = path.join(workDir, "concatenated.mp4");
    await run(ffmpegPath, [
      "-y", "-f", "concat", "-safe", "0", "-i", listPath,
      "-c", "copy", concatenatedPath,
    ]);

    const finalPath = path.join(workDir, "final.mp4");
    await run(ffmpegPath, [
      "-y", "-i", concatenatedPath, "-i", narrationPath,
      "-c:v", "copy", "-c:a", "aac", "-shortest",
      finalPath,
    ]);

    return await fs.readFile(finalPath);
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}