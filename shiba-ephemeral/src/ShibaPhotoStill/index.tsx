import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Captions } from "../components/Captions";
import { Confetti } from "../Shiba/Confetti";
import { PawBurst } from "../Shiba/PawBurst";
import { SunRays } from "../Shiba/SunRays";
import { PLAYBACK_RATE, SFX_CUES, SFX_VOLUME } from "../Shiba/audio";

const PHOTO = staticFile("photos/shiba-portrait.jpg");

// Scene beats locked to the VO:
//   0      "Ephemeral!"
//   30     "means short-lived,"
//   90     "Like treats."
//   132    "Like squirrels."
//   175    "Like this video."
//   222    "Bork bork bork!"
const BEATS = {
  intro: 0,
  meaning: 30,
  treats: 90,
  squirrels: 132,
  thisVid: 175,
  bork: 222,
} as const;

type CropProps = {
  from: number;
  durationInFrames: number;
  // 1.0 = no zoom. >1.0 = zoom in. Crop ratios are 0..1.
  scaleStart: number;
  scaleEnd: number;
  // Horizontal pan in normalized space (-0.5..0.5 of frame width).
  panX?: [number, number];
  panY?: [number, number];
  tilt?: [number, number];
};

const PhotoCrop: React.FC<CropProps> = ({
  from,
  durationInFrames,
  scaleStart,
  scaleEnd,
  panX = [0, 0],
  panY = [0, 0],
  tilt = [0, 0],
}) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  const scale = interpolate(local, [0, durationInFrames], [scaleStart, scaleEnd], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(local, [0, durationInFrames], panX, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(local, [0, durationInFrames], panY, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rot = interpolate(local, [0, durationInFrames], tilt, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        transform: `translate(${x}%, ${y}%) scale(${scale}) rotate(${rot}deg)`,
        transformOrigin: "50% 45%",
      }}
    >
      <Img
        src={PHOTO}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 35%",
        }}
      />
    </div>
  );
};

// Bright punch-in flash at scene cuts.
const CutFlash: React.FC<{ at: number; intensity?: number }> = ({
  at,
  intensity = 0.85,
}) => {
  const frame = useCurrentFrame();
  const local = frame - at;
  if (local < 0 || local > 12) return null;
  const opacity = interpolate(local, [0, 2, 12], [0, intensity, 0], {
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

// Springy entrance shake — squishes the whole photo down then bounces up at
// the very start.
const EntranceShake: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bounce = spring({
    frame,
    fps,
    config: { damping: 7, stiffness: 110 },
  });
  const scale = interpolate(bounce, [0, 1], [0.7, 1.0]);
  const yPct = interpolate(bounce, [0, 1], [12, 0]);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateY(${yPct}%) scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
};

// Tilted lower-band scrim that keeps captions punching even on the busy
// green grass background.
const CaptionScrim: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 78%, rgba(0,0,0,0.65) 100%)",
    }}
  />
);

export const ShibaPhotoStill: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Background sun rays for warm energy outside the photo crop. */}
      <SunRays />

      {/* The photo, with one PhotoCrop per beat. Each beat re-renders a
          fresh crop with its own zoom + pan, producing the "rapid TikTok
          cut" feel without ever changing the source pixel. */}
      <Sequence
        from={BEATS.intro}
        durationInFrames={BEATS.meaning - BEATS.intro}
        layout="none"
      >
        <EntranceShake>
          <PhotoCrop
            from={BEATS.intro}
            durationInFrames={BEATS.meaning - BEATS.intro}
            scaleStart={1.4}
            scaleEnd={1.55}
            panY={[-3, 0]}
            tilt={[-3, 0]}
          />
        </EntranceShake>
      </Sequence>

      <Sequence
        from={BEATS.meaning}
        durationInFrames={BEATS.treats - BEATS.meaning}
        layout="none"
      >
        <PhotoCrop
          from={BEATS.meaning}
          durationInFrames={BEATS.treats - BEATS.meaning}
          scaleStart={1.15}
          scaleEnd={1.3}
          panX={[2, -3]}
          panY={[1, 2]}
        />
      </Sequence>

      {/* "Like treats." — punch in on the smile/teeth. */}
      <Sequence
        from={BEATS.treats}
        durationInFrames={BEATS.squirrels - BEATS.treats}
        layout="none"
      >
        <PhotoCrop
          from={BEATS.treats}
          durationInFrames={BEATS.squirrels - BEATS.treats}
          scaleStart={2.2}
          scaleEnd={2.5}
          panX={[0, 1]}
          panY={[10, 12]}
          tilt={[2, -2]}
        />
      </Sequence>

      {/* "Like squirrels." — punch in on the eyes. */}
      <Sequence
        from={BEATS.squirrels}
        durationInFrames={BEATS.thisVid - BEATS.squirrels}
        layout="none"
      >
        <PhotoCrop
          from={BEATS.squirrels}
          durationInFrames={BEATS.thisVid - BEATS.squirrels}
          scaleStart={2.6}
          scaleEnd={3.0}
          panX={[-3, 5]}
          panY={[-12, -10]}
          tilt={[-3, 4]}
        />
      </Sequence>

      {/* "Like this video." — pull back to a wide. */}
      <Sequence
        from={BEATS.thisVid}
        durationInFrames={BEATS.bork - BEATS.thisVid}
        layout="none"
      >
        <PhotoCrop
          from={BEATS.thisVid}
          durationInFrames={BEATS.bork - BEATS.thisVid}
          scaleStart={1.3}
          scaleEnd={1.1}
          panX={[0, 0]}
          panY={[2, 0]}
        />
      </Sequence>

      {/* "Bork bork bork!" — final wide, slight push. */}
      <Sequence
        from={BEATS.bork}
        durationInFrames={300 - BEATS.bork}
        layout="none"
      >
        <PhotoCrop
          from={BEATS.bork}
          durationInFrames={300 - BEATS.bork}
          scaleStart={1.05}
          scaleEnd={1.18}
          panX={[0, 0]}
          panY={[0, -2]}
        />
      </Sequence>

      <CaptionScrim />

      {/* Energy: confetti, cut flashes at each beat, paw burst on sign-off. */}
      <Confetti density={60} />

      <CutFlash at={BEATS.meaning} intensity={0.6} />
      <CutFlash at={BEATS.treats} intensity={0.85} />
      <CutFlash at={BEATS.squirrels} intensity={0.85} />
      <CutFlash at={BEATS.thisVid} intensity={0.7} />
      <CutFlash at={BEATS.bork} intensity={0.9} />

      <PawBurst startFrame={BEATS.bork} />

      <Audio
        src={staticFile("vo/shiba.mp3")}
        volume={1.0}
        playbackRate={PLAYBACK_RATE}
      />

      <Captions captionsId="shiba" playbackRate={PLAYBACK_RATE} />

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
