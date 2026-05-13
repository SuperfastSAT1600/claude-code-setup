import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../Theme";

// Rotating sun-ray background. 12 stripes radiating from center, slowly
// spinning. Sits behind the Shiba and confetti as the warmest bg layer.

const RAY_COUNT = 14;

export const SunRays: React.FC = () => {
  const frame = useCurrentFrame();
  const rotation = frame * 0.25; // ~7.5°/sec

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at center, ${theme.colors.bg} 0%, ${theme.colors.bgDeep} 100%)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center",
          opacity: 0.5,
        }}
      >
        {Array.from({ length: RAY_COUNT }, (_, i) => {
          const angle = (i / RAY_COUNT) * 360;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "180%",
                height: "120px",
                backgroundColor: theme.colors.shibaCream,
                opacity: 0.35,
                transformOrigin: "0% 50%",
                transform: `rotate(${angle}deg) translateX(0%)`,
                filter: "blur(6px)",
              }}
            />
          );
        })}
      </div>

      {/* Soft white bloom at center to keep the Shiba visually anchored */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at center, rgba(255,255,255,0.45) 0%, transparent 50%)`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
