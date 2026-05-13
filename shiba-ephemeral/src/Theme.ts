import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

// Bright cartoon palette for the playful shiba reel. Warm sky bg + shiba
// orange + cream so the dog reads as a happy Shiba Inu.
export const theme = {
  colors: {
    bg: "#FFD56B", // warm sunny yellow
    bgDeep: "#FFB347", // sunset orange-ish for gradient depth
    shibaOrange: "#E08855",
    shibaCream: "#F5E4C6",
    shibaInk: "#3A2A1F",
    amber: "#FFB547",
    pink: "#FF8FB2",
    sky: "#87CEEB",
    leaf: "#7BC96F",
    captionInactive: "#FFFFFF",
    captionStroke: "#000000",
  },
  caption: {
    fontSizePx: 96,
    strokeWidthPx: 8,
    topPct: 0.62,
    bottomPct: 0.78,
    combineWindowMs: 700,
  },
  fonts: {
    body: inter,
  },
} as const;

export type SceneId = "intro" | "explain" | "signoff";

const SEGMENT_ORDER: SceneId[] = ["intro", "explain", "signoff"];

export const theme_segment_frames: Record<SceneId, number> = {
  intro: 75, // 2.5s — bouncy entrance + word reveal
  explain: 135, // 4.5s — talking head + example poof-outs
  signoff: 90, // 3s — "bork" exit with confetti
};

export const segmentStarts: Record<SceneId, number> = (() => {
  let cursor = 0;
  const starts = {} as Record<SceneId, number>;
  for (const key of SEGMENT_ORDER) {
    starts[key] = cursor;
    cursor += theme_segment_frames[key];
  }
  return starts;
})();

export const TOTAL_FRAMES = SEGMENT_ORDER.reduce(
  (sum, key) => sum + theme_segment_frames[key],
  0,
);

if (TOTAL_FRAMES !== 300) {
  throw new Error(
    `Theme.segment frames must sum to 300, got ${TOTAL_FRAMES}.`,
  );
}

export const COMP = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;
