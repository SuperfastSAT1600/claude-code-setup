import { COMP } from "../Theme";

export const PLAYBACK_RATE = 1.0;
export const SFX_VOLUME = 0.45;

export const SFX_URLS = {
  whoosh: "https://remotion.media/whoosh.wav",
  whip: "https://remotion.media/whip.wav",
  pageTurn: "https://remotion.media/page-turn.wav",
  uiSwitch: "https://remotion.media/switch.wav",
  mouseClick: "https://remotion.media/mouse-click.wav",
  ding: "https://remotion.media/ding.wav",
} as const;

export type SfxCue = {
  at: number;
  frame: number;
  src: string;
  volume?: number;
};

const s = (secs: number): number => Math.round(secs * COMP.fps);

// Light SFX. The VO is the focal sound; SFX punctuate visual beats only.
export const SFX_CUES: ReadonlyArray<SfxCue> = [
  // Shiba bounces in
  { at: 0.0, frame: s(0.0), src: SFX_URLS.whip, volume: 0.45 },
  // "Ephemeral!" lands huge
  { at: 0.3, frame: s(0.3), src: SFX_URLS.ding, volume: 0.55 },
  // Treat appears
  { at: 3.2, frame: s(3.2), src: SFX_URLS.uiSwitch, volume: 0.35 },
  // Treat poofs
  { at: 4.0, frame: s(4.0), src: SFX_URLS.whoosh, volume: 0.35 },
  // Squirrel darts in
  { at: 4.6, frame: s(4.6), src: SFX_URLS.mouseClick, volume: 0.35 },
  // Squirrel poofs
  { at: 5.6, frame: s(5.6), src: SFX_URLS.whoosh, volume: 0.35 },
  // Sign-off paw burst
  { at: 7.5, frame: s(7.5), src: SFX_URLS.ding, volume: 0.55 },
  { at: 7.6, frame: s(7.6), src: SFX_URLS.whip, volume: 0.4 },
];
