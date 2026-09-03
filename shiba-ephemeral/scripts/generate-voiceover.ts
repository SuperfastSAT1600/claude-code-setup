import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VOICEOVER_SCRIPT } from "../src/Shiba/voiceoverScript.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const OUT_DIR = join(PROJECT_ROOT, "public", "vo");
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

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM";

if (!API_KEY) {
  console.error(
    "[vo] ELEVENLABS_API_KEY not set. Add it to .env at project root or parent.",
  );
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const FORCE = process.env.FORCE === "1";
const IDS_FILTER = process.env.IDS
  ? new Set(
      process.env.IDS.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    )
  : null;

const MODEL_ID = "eleven_multilingual_v2";
const VOICE_SETTINGS = {
  stability: 0.45,
  similarity_boost: 0.75,
  style: 0.4,
  use_speaker_boost: true,
};

for (const seg of VOICEOVER_SCRIPT) {
  if (IDS_FILTER && !IDS_FILTER.has(seg.id)) continue;
  const outPath = join(OUT_DIR, `${seg.id}.mp3`);
  if (existsSync(outPath) && !FORCE) {
    console.log(`[vo] ${seg.id}: exists, skipping (FORCE=1 to override)`);
    continue;
  }
  const ttsText = seg.voText ?? seg.text;
  console.log(`[vo] ${seg.id}: "${ttsText}"`);
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: ttsText,
        model_id: MODEL_ID,
        voice_settings: VOICE_SETTINGS,
      }),
    },
  );
  if (!response.ok) {
    const err = await response.text();
    console.error(
      `[vo] ${seg.id} FAILED: HTTP ${response.status} — ${err.slice(0, 200)}`,
    );
    process.exit(1);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(outPath, buffer);
  console.log(`[vo] ${seg.id} -> ${outPath} (${buffer.length} bytes)`);
}

console.log("[vo] done.");
