import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from "@remotion/install-whisper-cpp";
import { VOICEOVER_SCRIPT } from "../src/Shiba/voiceoverScript.ts";

const require = createRequire(import.meta.url);
const FFMPEG_PATH = require("ffmpeg-static") as string;

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const VO_DIR = join(PROJECT_ROOT, "public", "vo");
const CAPTIONS_DIR = join(PROJECT_ROOT, "public", "captions");
const WHISPER_DIR = join(PROJECT_ROOT, "whisper.cpp");
const WHISPER_VERSION = "1.5.5";
const WHISPER_MODEL = "base.en" as const;

const ENV_CANDIDATES = [
  join(PROJECT_ROOT, ".env"),
  join(PROJECT_ROOT, "..", ".env"),
];

for (const envPath of ENV_CANDIDATES) {
  if (!existsSync(envPath)) continue;
  const contents = readFileSync(envPath, "utf-8");
  for (const line of contents.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

mkdirSync(CAPTIONS_DIR, { recursive: true });

const IDS_FILTER = process.env.IDS
  ? new Set(
      process.env.IDS.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    )
  : null;

console.log(
  `[captions] installing whisper.cpp ${WHISPER_VERSION} -> ${WHISPER_DIR}`,
);
await installWhisperCpp({ to: WHISPER_DIR, version: WHISPER_VERSION });

console.log(`[captions] downloading model "${WHISPER_MODEL}"`);
await downloadWhisperModel({ model: WHISPER_MODEL, folder: WHISPER_DIR });

// Whisper occasionally splits a domain word with the wrong first token
// (e.g. "ephemeros" -> " Eph" + "emer" + "os" or worse). Patch token text
// in place when we spot a known bad slice so the timestamps stay correct.
const TOKEN_PATCHES: Record<string, Record<string, string>> = {
  scene3: {
    " Ephimers": " ephemeros",
    " Ephimerus": " ephemeros",
    " Ephemoros": " ephemeros",
    " Ephimirus": " ephemeros",
  },
  scene9: {
    " EFEMERAL": " EPHEMERAL",
    " Ephemoral": " EPHEMERAL",
  },
};

for (const seg of VOICEOVER_SCRIPT) {
  if (IDS_FILTER && !IDS_FILTER.has(seg.id)) continue;
  const mp3Path = join(VO_DIR, `${seg.id}.mp3`);
  const wavPath = join(VO_DIR, `${seg.id}.wav`);
  const outPath = join(CAPTIONS_DIR, `${seg.id}.json`);

  if (!existsSync(mp3Path)) {
    console.warn(
      `[captions] ${seg.id}: ${mp3Path} not found — skipping. Run generate-voiceover.ts first.`,
    );
    continue;
  }

  if (!existsSync(wavPath)) {
    console.log(`[captions] ${seg.id}: converting mp3 -> 16kHz wav`);
    const ff = spawnSync(
      FFMPEG_PATH,
      ["-i", mp3Path, "-ar", "16000", wavPath, "-y"],
      { stdio: "inherit" },
    );
    if (ff.status !== 0) {
      console.error(
        `[captions] ${seg.id}: ffmpeg conversion FAILED (status ${ff.status}). Skipping.`,
      );
      continue;
    }
  } else {
    console.log(`[captions] ${seg.id}: reusing existing wav ${wavPath}`);
  }

  console.log(`[captions] ${seg.id}: transcribing`);
  const whisperCppOutput = await transcribe({
    model: WHISPER_MODEL,
    whisperPath: WHISPER_DIR,
    whisperCppVersion: WHISPER_VERSION,
    inputPath: wavPath,
    tokenLevelTimestamps: true,
  });

  const { captions } = toCaptions({ whisperCppOutput });

  const patches = TOKEN_PATCHES[seg.id];
  if (patches) {
    for (const cap of captions) {
      if (patches[cap.text]) cap.text = patches[cap.text];
    }
  }

  writeFileSync(outPath, JSON.stringify(captions, null, 2));
  console.log(
    `[captions] ${seg.id} -> ${outPath} (${captions.length} tokens)`,
  );
}

console.log("[captions] done.");
