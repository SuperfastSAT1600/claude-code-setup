import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../Theme";

// A treat (cookie) that springs in, hangs briefly, then poofs into sparkles.
// Used in the "explain" scene as a visual example of "ephemeral."

type Props = {
  centerX: number;
  centerY: number;
  size?: number;
  popFrame?: number;
  rotateDir?: 1 | -1;
};

export const TreatPoof: React.FC<Props> = ({
  centerX,
  centerY,
  size = 100,
  popFrame = 24,
  rotateDir = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 160 },
  });

  // Local time since pop.
  const sincePop = frame - popFrame;
  let popScale = 1;
  let popOpacity = 1;
  if (sincePop > 0) {
    popScale = interpolate(sincePop, [0, 4, 8], [1, 1.3, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    popOpacity = interpolate(sincePop, [0, 4, 8], [1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  const rot = Math.sin(frame * 0.18) * 12 * rotateDir;

  // Sparkle burst frames after pop.
  const sparkleProgress = interpolate(sincePop, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sparkleOpacity = interpolate(sincePop, [0, 4, 14], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const treatVisible = popScale > 0 && popOpacity > 0;

  return (
    <div
      style={{
        position: "absolute",
        left: centerX - size / 2,
        top: centerY - size / 2,
        width: size,
        height: size,
        pointerEvents: "none",
      }}
    >
      {treatVisible ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${entry * popScale}) rotate(${rot}deg)`,
            opacity: popOpacity,
          }}
        >
          <svg viewBox="0 0 100 100">
            {/* Cookie base */}
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="#D4A56A"
              stroke={theme.colors.shibaInk}
              strokeWidth="4"
            />
            {/* Chocolate chips */}
            {[
              [34, 32],
              [62, 38],
              [44, 56],
              [66, 60],
              [36, 70],
              [56, 72],
            ].map(([cx, cy], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="6"
                fill={theme.colors.shibaInk}
              />
            ))}
          </svg>
        </div>
      ) : null}

      {/* Sparkle burst when treat pops */}
      {sincePop > 0 && sincePop < 16 ? (
        <svg
          viewBox="-50 -50 100 100"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
          }}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const dist = sparkleProgress * 60;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;
            return (
              <g
                key={i}
                transform={`translate(${x}, ${y})`}
                opacity={sparkleOpacity}
              >
                <circle
                  r="6"
                  fill={i % 2 === 0 ? theme.colors.amber : theme.colors.pink}
                />
              </g>
            );
          })}
        </svg>
      ) : null}
    </div>
  );
};
