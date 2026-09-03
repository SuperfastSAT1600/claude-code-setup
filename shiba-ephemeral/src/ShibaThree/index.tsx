import { useEffect, useMemo, useRef, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Captions } from "../components/Captions";
import { Confetti } from "../Shiba/Confetti";
import { PawBurst } from "../Shiba/PawBurst";
import { SunRays } from "../Shiba/SunRays";
import { PLAYBACK_RATE, SFX_CUES, SFX_VOLUME } from "../Shiba/audio";
import { COMP } from "../Theme";

const MODEL_URL = staticFile("models/shiba-quaternius.glb");

const ANIMATION_PLAN: { from: number; clip: string }[] = [
  { from: 0, clip: "AnimalArmature|Idle_2" },
  { from: 90, clip: "AnimalArmature|Eating" },
  { from: 132, clip: "AnimalArmature|Gallop" },
  { from: 200, clip: "AnimalArmature|Idle" },
  { from: 230, clip: "AnimalArmature|Jump_ToIdle" },
];

type Loaded = {
  scene: THREE.Object3D;
  animations: THREE.AnimationClip[];
};

const ShibaModel: React.FC<{ data: Loaded }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const group = useRef<THREE.Group>(null);

  const mixer = useMemo(() => new THREE.AnimationMixer(data.scene), [data.scene]);
  const actions = useMemo(() => {
    const out: Record<string, THREE.AnimationAction> = {};
    for (const clip of data.animations) {
      out[clip.name] = mixer.clipAction(clip);
    }
    return out;
  }, [data.animations, mixer]);

  // Compute the model's actual bounding box once we have the scene, so we
  // can auto-fit any glTF dropped in. Quaternius assets are usually ~0.03
  // native units across, which is much smaller than the scene cares about.
  const { fitScale, fitOffset } = useMemo(() => {
    const tmp = new THREE.Object3D();
    tmp.add(data.scene);
    const box = new THREE.Box3().setFromObject(tmp);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    // Use the YZ bounding extents to fit a portrait frame — the rig's
    // bones extend the bbox tall but the visible dog is roughly cube-ish.
    const targetHeight = 1.4;
    const fit = targetHeight / Math.max(size.y, 1);
    return {
      fitScale: fit,
      fitOffset: new THREE.Vector3(-center.x * fit, -box.min.y * fit, -center.z * fit),
    };
  }, [data.scene]);

  const activeClipRef = useRef<string | null>(null);

  useEffect(() => {
    const seg = [...ANIMATION_PLAN]
      .reverse()
      .find((s) => frame >= s.from);
    const wanted = seg?.clip ?? data.animations[0]?.name;
    if (!wanted || activeClipRef.current === wanted) return;
    const next = actions[wanted];
    if (!next) return;
    const prev = activeClipRef.current ? actions[activeClipRef.current] : null;
    if (prev) prev.fadeOut(0.2);
    next.reset().fadeIn(0.2).play();
    activeClipRef.current = wanted;
  }, [frame, actions, data.animations]);

  // Pin mixer time to the current frame so renders are deterministic.
  useEffect(() => {
    mixer.setTime(frame / fps);
  }, [frame, fps, mixer]);

  const bob = Math.sin(frame * 0.26) * 0.06;
  const yaw = Math.sin(frame * 0.07) * 0.15;
  const entryT = Math.min(1, frame / 25);
  const entry = 1 - Math.pow(1 - entryT, 3);
  const entryY = -1.5 * (1 - entry);

  return (
    <group
      ref={group}
      position={[fitOffset.x, fitOffset.y - 1.0 + bob + entryY, fitOffset.z]}
      rotation={[0, yaw + Math.PI * 0.05, 0]}
      scale={[fitScale, fitScale, fitScale]}
    >
      <primitive object={data.scene} />
    </group>
  );
};

const ShibaScene: React.FC<{ data: Loaded | null }> = ({ data }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <color attach="background" args={["#FFD56B"]} />
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#FFE8B0", "#5A3018", 0.6]} />
      <directionalLight
        position={[3, 5, 2]}
        intensity={3.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.8} color="#FFE0B0" />

      {/* Ground plane to catch shadow. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.32, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#E89A4A" roughness={1} />
      </mesh>

      {data ? (
        <ShibaModel data={data} />
      ) : (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      )}

      <pointLight
        position={[Math.sin(frame * 0.1) * 2, 1.5, 2]}
        intensity={1.2}
        color="#FFB347"
      />
    </>
  );
};

// Load the glTF in the React DOM tree (NOT inside ThreeCanvas) so Remotion's
// delayRender / continueRender work normally.
const useGltf = (url: string): Loaded | null => {
  const [data, setData] = useState<Loaded | null>(null);
  const [handle] = useState(() => delayRender(`loading ${url}`));
  useEffect(() => {
    let cancelled = false;
    const loader = new GLTFLoader();
    loader.load(
      url,
      (g) => {
        if (cancelled) return;
        setData({ scene: g.scene, animations: g.animations });
      },
      undefined,
      (err) => {
        console.error("[ShibaThree] GLTF load failed", err);
        if (!cancelled) continueRender(handle);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [url, handle]);
  useEffect(() => {
    if (data) continueRender(handle);
  }, [data, handle]);
  return data;
};

export const ShibaThree: React.FC = () => {
  const data = useGltf(MODEL_URL);
  const frame = useCurrentFrame();
  // Pulled-back, slightly elevated angle so the whole dog stays in the
  // portrait frame with breathing room top and bottom.
  const camZ = interpolate(frame, [0, 300], [3.8, 3.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const camY = interpolate(frame, [0, 300], [1.1, 0.9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFD56B" }}>
      <SunRays />

      <ThreeCanvas
        width={COMP.width}
        height={COMP.height}
        camera={{ position: [0, camY, camZ], fov: 30 }}
        shadows
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        style={{ position: "absolute", inset: 0 }}
      >
        <ShibaScene data={data} />
      </ThreeCanvas>

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
