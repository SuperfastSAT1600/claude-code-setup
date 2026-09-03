import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Caption } from "@remotion/captions";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const CAPTIONS_DIR = join(PROJECT_ROOT, "public", "captions");

type MergePatch = { from: string[]; to: string };
type Patches = { merges?: MergePatch[] };

const PATCHES: Record<string, Patches> = {
  shiba: {
    merges: [
      // Whisper hears "Ephemeral!" as "If ephemeral" because the bang
      // confuses the front of the word. Merge them and capitalize back.
      { from: ["If", " ephemeral"], to: "Ephemeral!" },
      // Re-join hyphenated short-lived (whisper splits on the hyphen).
      { from: [" short", "-", "lived"], to: " short-lived" },
    ],
  },
};

const applyMerges = (captions: Caption[], merges: MergePatch[]): Caption[] => {
  for (const merge of merges) {
    let applied = false;
    for (let i = 0; i <= captions.length - merge.from.length; i++) {
      const window = captions.slice(i, i + merge.from.length);
      if (window.every((t, k) => t.text === merge.from[k])) {
        const first = window[0];
        const last = window[window.length - 1];
        captions.splice(i, merge.from.length, {
          text: merge.to,
          startMs: first.startMs,
          endMs: last.endMs,
          timestampMs: first.timestampMs,
          confidence: first.confidence,
        });
        applied = true;
        break;
      }
    }
    if (!applied) {
      console.warn("[patch] unmatched merge:", JSON.stringify(merge));
    }
  }
  return captions;
};

for (const [sceneId, patches] of Object.entries(PATCHES)) {
  const path = join(CAPTIONS_DIR, sceneId + ".json");
  let captions: Caption[];
  try {
    captions = JSON.parse(readFileSync(path, "utf-8")) as Caption[];
  } catch {
    console.warn("[patch] " + sceneId + ": cannot read " + path);
    continue;
  }
  if (patches.merges) {
    captions = applyMerges(captions, patches.merges);
  }
  writeFileSync(path, JSON.stringify(captions, null, 2));
  console.log(
    "[patch] " +
      sceneId +
      ": " +
      captions.length +
      " tokens, text: " +
      captions.map((t) => t.text).join("").trim(),
  );
}

console.log("[patch] done.");
