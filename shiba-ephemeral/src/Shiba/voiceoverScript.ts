// Source of truth for the Shiba's monologue. Single track — the whole 10s
// is one continuous excited little speech. The Shiba "voices" it via the
// caption track plus a barky tone.

export type SceneId = "shiba";

export type VoiceoverSegment = {
  id: SceneId;
  text: string;
  voText?: string;
};

export const VOICEOVER_SCRIPT: VoiceoverSegment[] = [
  {
    id: "shiba",
    text: "Ephemeral! Means short-lived. Like treats. Like squirrels. Like this video. Bork bork bork!",
  },
];
