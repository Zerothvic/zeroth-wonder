// Bottleneck 12.3/11: no free, unlimited, sung-vocal music API exists.
// MVP approach: free instrumental model + free TTS spoken/rap-style vocal,
// mixed with ffmpeg. Swap in a paid provider later if budget allows.
export async function runSongJob(genJob) {
  throw new Error(
    "TODO: implement once a free instrumental provider (e.g. Hugging Face MusicGen) " +
    "and a free TTS provider are chosen — see aiGateway.generateSpeech()"
  );
}