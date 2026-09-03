import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Post-process an already-rendered MP4 to a 1.2x sped-up version. Uses
// ffmpeg's atempo filter for audio (preserves pitch) and setpts for video.
// Per the Remotion short-form pacing rule, 1.1x–1.2x is the safe brainrot
// range without sounding chipmunky.

const require = createRequire(import.meta.url);
const FFMPEG_PATH = require("ffmpeg-static") as string;

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

const INPUT = process.env.INPUT ?? join(PROJECT_ROOT, "out", "ephemeral-full.mp4");
const OUTPUT = process.env.OUTPUT ?? join(PROJECT_ROOT, "out", "ephemeral-final.mp4");
const RATE = Number(process.env.RATE ?? 1.2);

if (!existsSync(INPUT)) {
  console.error(`[speed-up] Input not found: ${INPUT}`);
  process.exit(1);
}

const inverse = 1 / RATE;
const filter = `[0:v]setpts=PTS*${inverse}[v];[0:a]atempo=${RATE}[a]`;

console.log(`[speed-up] ${INPUT} -> ${OUTPUT} at ${RATE}x`);

const ff = spawnSync(
  FFMPEG_PATH,
  [
    "-y",
    "-i",
    INPUT,
    "-filter_complex",
    filter,
    "-map",
    "[v]",
    "-map",
    "[a]",
    "-c:v",
    "libx264",
    "-crf",
    "18",
    "-preset",
    "medium",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    OUTPUT,
  ],
  { stdio: "inherit" },
);

if (ff.status !== 0) {
  console.error(`[speed-up] ffmpeg failed with status ${ff.status}`);
  process.exit(ff.status ?? 1);
}

console.log(`[speed-up] done: ${OUTPUT}`);
