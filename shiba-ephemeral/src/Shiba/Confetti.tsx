import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../Theme";

// Always-on confetti / sparkle layer. Constant rain of small rotated rects
// + circles drifting through the frame. Deterministic per-frame so renders
// are stable.

const seededRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
};

const COLORS = [
  theme.colors.shibaOrange,
  theme.colors.shibaCream,
  theme.colors.pink,
  theme.colors.amber,
  theme.colors.sky,
  theme.colors.leaf,
];

type Bit = {
  x: number;
  baseY: number;
  speed: number;
  size: number;
  rotSpeed: number;
  rotPhase: number;
  color: string;
  isRect: boolean;
  phase: number;
};

const buildBits = (count: number): Bit[] => {
  const rng = seededRng(0xC0FFE);
  const bits: Bit[] = [];
  for (let i = 0; i < count; i++) {
    bits.push({
      x: rng(),
      baseY: rng(),
      speed: 0.0035 + rng() * 0.006,
      size: 7 + rng() * 18,
      rotSpeed: (rng() - 0.5) * 0.12,
      rotPhase: rng() * Math.PI * 2,
      color: COLORS[Math.floor(rng() * COLORS.length)],
      isRect: rng() > 0.4,
      phase: rng() * Math.PI * 2,
    });
  }
  return bits;
};

export const Confetti: React.FC<{ density?: number }> = ({ density = 70 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const bits = useMemo(() => buildBits(density), [density]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {bits.map((b, i) => {
        // Drift down across the screen, wrap.
        const yWrap = (b.baseY + frame * b.speed) % 1;
        const y = yWrap < 0 ? yWrap + 1 : yWrap;
        const swayX = Math.sin(frame * 0.03 + b.phase) * 0.04;
        const px = (b.x + swayX) * width;
        const py = y * height;
        const rot = frame * b.rotSpeed + b.rotPhase;
        const opacity = 0.5 + 0.4 * Math.sin(frame * 0.05 + b.phase);

        if (b.isRect) {
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: px - b.size / 2,
                top: py - b.size / 2,
                width: b.size,
                height: b.size * 0.55,
                backgroundColor: b.color,
                transform: `rotate(${rot}rad)`,
                opacity,
                borderRadius: 2,
                boxShadow: `0 0 ${b.size * 0.4}px ${b.color}aa`,
              }}
            />
          );
        }
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px - b.size / 2,
              top: py - b.size / 2,
              width: b.size,
              height: b.size,
              backgroundColor: b.color,
              borderRadius: "50%",
              opacity,
              boxShadow: `0 0 ${b.size * 0.6}px ${b.color}aa`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
