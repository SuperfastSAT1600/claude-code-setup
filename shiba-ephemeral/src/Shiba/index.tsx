import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COMP } from "../Theme";
import { Captions } from "../components/Captions";
import { Confetti } from "./Confetti";
import { PawBurst } from "./PawBurst";
import { Shiba } from "./Shiba";
import { SquirrelDart } from "./SquirrelDart";
import { SunRays } from "./SunRays";
import { TreatPoof } from "./TreatPoof";
import { PLAYBACK_RATE, SFX_CUES, SFX_VOLUME } from "./audio";

// VO duration in frames (audio file is ~7.4s at 30fps).
const SPEAKING_END = 222;

// Frame layout for scene-specific elements (relative to composition start):
const TREAT_FROM = 90;   // ~3.0s — "Like treats."
const TREAT_POP = TREAT_FROM + 24;
const SQUIRREL_FROM = 132; // ~4.4s — "Like squirrels."
const SQUIRREL_POOF = 24;
const PAW_BURST_FROM = 222; // sign-off

const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Entrance: Shiba flies up from below the frame in the first ~25 frames.
  const entrance = spring({
    frame,
    fps,
    config: { damping: 9, stiffness: 130 },
  });
  const entryY = interpolate(entrance, [0, 1], [800, 0]);

  // Excited wobble on entrance, settles to gentle sway.
  const wobble = Math.sin(frame * 0.22) * 4 * (1 - entrance) + Math.sin(frame * 0.1) * 1.5;

  // Mouth syncing — pulses while VO is speaking, closed after.
  const isTalking = frame < SPEAKING_END;
  const mouthOpen = isTalking
    ? Math.pow(Math.sin(frame * 0.55), 2) * 0.95
    : 0.05;

  // Whole-dog scale — grows slightly into the scene then settles.
  const scale = interpolate(entrance, [0, 1], [0.7, 1.45], {
    extrapolateRight: "clamp",
  });

  // Tail wags faster during the bork-bork-bork sign-off.
  const tailEnergy = frame > 200 ? 2.4 : 1.2;

  // Position the Shiba higher than center so the caption band has air.
  const shibaCenterX = width / 2;
  const shibaCenterY = height * 0.40;

  return (
    <div
      style={{
        position: "absolute",
        left: shibaCenterX - 300,
        top: shibaCenterY - 350 + entryY,
        width: 600,
        height: 700,
      }}
    >
      <Shiba
        frame={frame}
        mouthOpen={mouthOpen}
        scale={scale}
        wobbleDeg={wobble}
        tailEnergy={tailEnergy}
      />
    </div>
  );
};

export const ShibaEphemeral: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Background — slow rotating sun rays + bright gradient. */}
      <SunRays />

      {/* Always-on confetti. */}
      <Confetti density={70} />

      {/* The dog — continuous across all 300 frames. */}
      <Stage />

      {/* Scene-specific element: treat appears, then poofs. */}
      <Sequence from={TREAT_FROM} durationInFrames={40} layout="none">
        <TreatPoof
          centerX={COMP.width * 0.78}
          centerY={COMP.height * 0.36}
          size={170}
          popFrame={TREAT_POP - TREAT_FROM}
        />
      </Sequence>

      {/* Scene-specific element: squirrel darts across the lower band, poofs. */}
      <Sequence from={SQUIRREL_FROM} durationInFrames={40} layout="none">
        <SquirrelDart
          startX={-90}
          endX={COMP.width + 90}
          y={COMP.height * 0.62}
          poofFrame={SQUIRREL_POOF}
          size={150}
        />
      </Sequence>

      {/* Sign-off paw + heart burst. */}
      <PawBurst startFrame={PAW_BURST_FROM} />

      {/* Voiceover. */}
      <Audio
        src={staticFile("vo/shiba.mp3")}
        volume={1.0}
        playbackRate={PLAYBACK_RATE}
      />

      {/* Captions — single track for the whole video. */}
      <Captions
        captionsId="shiba"
        playbackRate={PLAYBACK_RATE}
      />

      {/* SFX cue sheet. */}
      {SFX_CUES.map((cue, i) => (
        <Sequence
          key={`sfx-${i}-${cue.frame}`}
          from={cue.frame}
          layout="none"
        >
          <Audio
            src={cue.src}
            volume={cue.volume ?? SFX_VOLUME}
            playbackRate={PLAYBACK_RATE}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
