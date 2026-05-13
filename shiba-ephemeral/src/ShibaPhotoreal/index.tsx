import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Captions } from "../components/Captions";
import { Confetti } from "../Shiba/Confetti";
import { PawBurst } from "../Shiba/PawBurst";
import { PLAYBACK_RATE, SFX_CUES, SFX_VOLUME } from "../Shiba/audio";

const CUT_TO_B = 132; // ~4.4s — at "Like squirrels."
const PAW_BURST_FROM = 222; // sign-off

// Two real Shiba clips from Pexels (1080x1920 portrait, native 30fps,
// Pexels License — free for commercial + personal, no attribution required).
const CLIP_A = staticFile("footage/shiba-portrait-29243898.mp4");
const CLIP_B = staticFile("footage/shiba-portrait-29243903.mp4");

// Subtle Ken Burns push so even a static Shiba clip never sits still.
const KenBurns: React.FC<{
  from?: number;
  durationInFrames: number;
  scaleStart?: number;
  scaleEnd?: number;
  panX?: [number, number];
  panY?: [number, number];
  src: string;
  startFromSec?: number;
}> = ({
  from = 0,
  durationInFrames,
  scaleStart = 1.04,
  scaleEnd = 1.14,
  panX = [0, 0],
  panY = [0, 0],
  src,
  startFromSec = 0,
}) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  const scale = interpolate(local, [0, durationInFrames], [scaleStart, scaleEnd], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tx = interpolate(local, [0, durationInFrames], panX, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ty = interpolate(local, [0, durationInFrames], panY, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
      }}
    >
      <OffthreadVideo
        src={src}
        startFrom={Math.round(startFromSec * 30)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};

// Bright punch-in flash at scene cuts so the transition reads kinetic.
const CutFlash: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const local = frame - at;
  if (local < 0 || local > 10) return null;
  const opacity = interpolate(local, [0, 2, 10], [0, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(255,200,140,0.6) 30%, rgba(255,140,80,0) 70%)",
        opacity,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};

// Cinematic bottom vignette to keep the caption legible over bright clips.
const CaptionScrim: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.45) 78%, rgba(0,0,0,0.65) 100%)",
    }}
  />
);

// Soft warm-color top vignette so the dog reads as the focal point.
const TopWarmth: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at 50% 35%, rgba(255,220,160,0.0) 50%, rgba(255,170,80,0.25) 100%)",
      mixBlendMode: "soft-light",
    }}
  />
);

export const ShibaPhotoreal: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Clip A: 0..CUT_TO_B with a slow zoom-in. */}
      <Sequence from={0} durationInFrames={CUT_TO_B} layout="none">
        <KenBurns
          durationInFrames={CUT_TO_B}
          scaleStart={1.04}
          scaleEnd={1.16}
          panX={[0, -20]}
          panY={[0, -10]}
          src={CLIP_A}
          startFromSec={0}
        />
      </Sequence>

      {/* Clip B: CUT_TO_B..end with a continued push that pulls back for the sign-off. */}
      <Sequence from={CUT_TO_B} durationInFrames={300 - CUT_TO_B} layout="none">
        <KenBurns
          durationInFrames={300 - CUT_TO_B}
          scaleStart={1.18}
          scaleEnd={1.05}
          panX={[10, -10]}
          panY={[15, -5]}
          src={CLIP_B}
          startFromSec={2}
        />
      </Sequence>

      {/* Color/contrast polish on top of the footage. */}
      <TopWarmth />
      <CaptionScrim />

      {/* Energy layer — confetti drifts through the whole reel. */}
      <Confetti density={50} />

      {/* Cut flashes at scene boundaries. */}
      <CutFlash at={CUT_TO_B} />
      <CutFlash at={PAW_BURST_FROM} />

      {/* Sign-off paw + heart burst keeps the cartoon energy at the bork bork. */}
      <PawBurst startFrame={PAW_BURST_FROM} />

      {/* Voiceover. */}
      <Audio
        src={staticFile("vo/shiba.mp3")}
        volume={1.0}
        playbackRate={PLAYBACK_RATE}
      />

      {/* Captions. */}
      <Captions captionsId="shiba" playbackRate={PLAYBACK_RATE} />

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
