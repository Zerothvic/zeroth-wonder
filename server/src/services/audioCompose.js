import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import ffmpegPath from "ffmpeg-static";

const run = promisify(execFile);

/**
 * Mixes an optional intro clip + vocal track + optional instrumental bed
 * into a single MP3. If instrumentalBuffer is null, returns intro+vocal only.
 */
export async function composeSongMp3({ introBuffer, vocalBuffer, instrumentalBuffer }) {
  const workDir = path.join(os.tmpdir(), `zw-song-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await fs.mkdir(workDir, { recursive: true });

  try {
    const introPath = path.join(workDir, "intro.mp3");
    const vocalPath = path.join(workDir, "vocal.mp3");
    await fs.writeFile(introPath, introBuffer);
    await fs.writeFile(vocalPath, vocalBuffer);

    // Concat intro + vocal first (DJ shout-out, then the vocal performance)
    const introVocalPath = path.join(workDir, "intro-vocal.mp3");
    const listPath = path.join(workDir, "concat-list.txt");
    await fs.writeFile(listPath, `file '${introPath}'\nfile '${vocalPath}'`);
    await run(ffmpegPath, ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", introVocalPath]);

    if (!instrumentalBuffer) {
      return await fs.readFile(introVocalPath);
    }

    const instrumentalPath = path.join(workDir, "instrumental.mp3");
    await fs.writeFile(instrumentalPath, instrumentalBuffer);

    const finalPath = path.join(workDir, "final.mp3");
    // Mix vocal (full volume) over a quieter looped instrumental bed
    await run(ffmpegPath, [
      "-y",
      "-i", introVocalPath,
      "-stream_loop", "-1", "-i", instrumentalPath,
      "-filter_complex", "[1:a]volume=0.35[bg];[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2",
      finalPath,
    ]);

    return await fs.readFile(finalPath);
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}