import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  staticFile,
} from "remotion";
import { Captions } from "../components/Captions";
import { Confetti } from "../Shiba/Confetti";
import { PawBurst } from "../Shiba/PawBurst";
import { PLAYBACK_RATE, SFX_CUES, SFX_VOLUME } from "../Shiba/audio";

const BG_VIDEO = staticFile("render/shiba-blender.mp4");

// Cinematic bottom scrim so captions stay legible over the Blender output.
const CaptionScrim: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4) 78%, rgba(0,0,0,0.6) 100%)",
    }}
  />
);

export const ShibaBlender: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFD56B" }}>
      <OffthreadVideo
        src={BG_VIDEO}
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <CaptionScrim />

      <Confetti density={50} />

      <PawBurst startFrame={222} />

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
