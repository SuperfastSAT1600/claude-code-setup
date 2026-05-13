/**
 * Encodes Blender's PNG sequence in out/blender-frames/ to a silent MP4 at
 * public/render/shiba-blender.mp4 so it can be picked up by the
 * ShibaBlender Remotion composition as a background video.
 *
 * Usage: npx tsx scripts/encode-blender.ts
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FRAMES_DIR = join(ROOT, "out", "blender-frames");
const OUT_DIR = join(ROOT, "public", "render");
const OUT_PATH = join(OUT_DIR, "shiba-blender.mp4");

const require = createRequire(import.meta.url);
const ffmpegPath: string = require("ffmpeg-static");

if (!existsSync(FRAMES_DIR)) {
  console.error(`Blender frames dir missing: ${FRAMES_DIR}`);
  process.exit(1);
}

const frames = readdirSync(FRAMES_DIR).filter((n) => n.endsWith(".png"));
if (frames.length === 0) {
  console.error(`No PNG frames in ${FRAMES_DIR}`);
  process.exit(1);
}
console.log(`encoding ${frames.length} frames -> ${OUT_PATH}`);

mkdirSync(OUT_DIR, { recursive: true });

// frame_0001.png through frame_0300.png — 4-digit zero-padded.
const inputPattern = join(FRAMES_DIR, "frame_%04d.png");

const args = [
  "-y",
  "-framerate", "30",
  "-start_number", "1",
  "-i", inputPattern,
  "-vf", "scale=1080:1920:flags=lanczos,format=yuv420p",
  "-c:v", "libx264",
  "-preset", "slow",
  "-crf", "18",
  "-movflags", "+faststart",
  OUT_PATH,
];

console.log("ffmpeg", args.join(" "));
const res = spawnSync(ffmpegPath, args, { stdio: "inherit" });
if (res.status !== 0) {
  console.error(`ffmpeg failed with status ${res.status}`);
  process.exit(res.status ?? 1);
}
console.log(`wrote ${OUT_PATH}`);
