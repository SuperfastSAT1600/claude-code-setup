import "./index.css";
import { Composition } from "remotion";
import { ShibaEphemeral } from "./Shiba";
import { ShibaBlender } from "./ShibaBlender";
import { ShibaPhotoStill } from "./ShibaPhotoStill";
import { ShibaPhotoreal } from "./ShibaPhotoreal";
import { ShibaThree } from "./ShibaThree";
import { COMP, TOTAL_FRAMES } from "./Theme";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShibaEphemeral"
        component={ShibaEphemeral}
        durationInFrames={TOTAL_FRAMES}
        fps={COMP.fps}
        width={COMP.width}
        height={COMP.height}
      />
      <Composition
        id="ShibaPhotoreal"
        component={ShibaPhotoreal}
        durationInFrames={TOTAL_FRAMES}
        fps={COMP.fps}
        width={COMP.width}
        height={COMP.height}
      />
      <Composition
        id="ShibaThree"
        component={ShibaThree}
        durationInFrames={TOTAL_FRAMES}
        fps={COMP.fps}
        width={COMP.width}
        height={COMP.height}
      />
      <Composition
        id="ShibaBlender"
        component={ShibaBlender}
        durationInFrames={TOTAL_FRAMES}
        fps={COMP.fps}
        width={COMP.width}
        height={COMP.height}
      />
      <Composition
        id="ShibaPhotoStill"
        component={ShibaPhotoStill}
        durationInFrames={TOTAL_FRAMES}
        fps={COMP.fps}
        width={COMP.width}
        height={COMP.height}
      />
    </>
  );
};
