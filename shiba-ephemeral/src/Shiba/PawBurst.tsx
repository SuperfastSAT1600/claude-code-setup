import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../Theme";

// Big radial burst of paw prints + hearts at the sign-off. Each piece
// shoots outward from center and fades.

const COUNT = 16;

export const PawBurst: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  if (local < 0) return null;

  return (
    <svg
      viewBox="-540 -960 1080 1920"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {Array.from({ length: COUNT }, (_, i) => {
        const angle = (i / COUNT) * Math.PI * 2;
        const dist = interpolate(local, [0, 60], [40, 740], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const opacity = interpolate(local, [0, 8, 50, 60], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const scale = interpolate(local, [0, 12, 60], [0, 1.2, 0.8], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        const rot = angle * (180 / Math.PI) + 90 + Math.sin(local * 0.2 + i) * 20;
        const isHeart = i % 2 === 1;

        if (isHeart) {
          return (
            <g
              key={i}
              transform={`translate(${x}, ${y}) scale(${scale}) rotate(${rot})`}
              opacity={opacity}
            >
              <path
                d="M 0 -10 C -22 -42, -54 -22, 0 32 C 54 -22, 22 -42, 0 -10 Z"
                fill={theme.colors.pink}
                stroke={theme.colors.shibaInk}
                strokeWidth="3"
              />
            </g>
          );
        }
        return (
          <g
            key={i}
            transform={`translate(${x}, ${y}) scale(${scale}) rotate(${rot})`}
            opacity={opacity}
          >
            {/* Paw pad */}
            <ellipse
              cx="0"
              cy="6"
              rx="16"
              ry="14"
              fill={theme.colors.shibaInk}
            />
            {/* Toes */}
            <circle cx="-14" cy="-10" r="6" fill={theme.colors.shibaInk} />
            <circle cx="-4" cy="-16" r="6" fill={theme.colors.shibaInk} />
            <circle cx="8" cy="-16" r="6" fill={theme.colors.shibaInk} />
            <circle cx="18" cy="-10" r="6" fill={theme.colors.shibaInk} />
          </g>
        );
      })}
    </svg>
  );
};
