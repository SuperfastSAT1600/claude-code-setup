import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../Theme";

// A tiny squirrel silhouette that darts across the bottom of the frame,
// then poofs out at the far side. Used as a second "ephemeral" example.

type Props = {
  startX: number;
  endX: number;
  y: number;
  poofFrame: number;
  size?: number;
};

export const SquirrelDart: React.FC<Props> = ({
  startX,
  endX,
  y,
  poofFrame,
  size = 90,
}) => {
  const frame = useCurrentFrame();

  // Run from startX to endX over poofFrame frames.
  const t = interpolate(frame, [0, poofFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cx = startX + (endX - startX) * t;
  // Bouncy run — small vertical hop per stride.
  const hop = Math.abs(Math.sin(frame * 0.6)) * 16;
  const cy = y - hop;
  // Body wobble.
  const tilt = Math.sin(frame * 0.5) * 8;

  const sincePoof = frame - poofFrame;
  let visible = true;
  if (sincePoof >= 0) visible = false;

  const ink = theme.colors.shibaInk;
  const fur = "#9C6F4A";
  const bellyFur = theme.colors.shibaCream;

  return (
    <div
      style={{
        position: "absolute",
        left: cx - size / 2,
        top: cy - size / 2,
        width: size,
        height: size,
        pointerEvents: "none",
      }}
    >
      {visible ? (
        <svg
          viewBox="0 0 100 100"
          style={{ transform: `rotate(${tilt}deg)` }}
        >
          {/* Big curled tail */}
          <path
            d="M 70 50 C 95 30, 95 5, 70 10 C 60 12, 60 28, 70 30"
            fill={fur}
            stroke={ink}
            strokeWidth="3"
          />
          {/* Body */}
          <ellipse cx="44" cy="55" rx="28" ry="18" fill={fur} stroke={ink} strokeWidth="3" />
          {/* Belly */}
          <ellipse cx="44" cy="62" rx="16" ry="10" fill={bellyFur} />
          {/* Head */}
          <circle cx="22" cy="46" r="14" fill={fur} stroke={ink} strokeWidth="3" />
          {/* Ear */}
          <path d="M 14 36 L 10 26 L 22 32 Z" fill={fur} stroke={ink} strokeWidth="2" />
          {/* Eye */}
          <circle cx="18" cy="44" r="3" fill={ink} />
          {/* Paws */}
          <ellipse cx="34" cy="74" rx="4" ry="3" fill={ink} />
          <ellipse cx="52" cy="74" rx="4" ry="3" fill={ink} />
        </svg>
      ) : null}

      {/* Poof on disappearance */}
      {sincePoof >= 0 && sincePoof < 14 ? (
        <svg
          viewBox="-50 -50 100 100"
          style={{
            position: "absolute",
            inset: 0,
            overflow: "visible",
          }}
        >
          {Array.from({ length: 10 }, (_, i) => {
            const angle = (i / 10) * Math.PI * 2;
            const dist = (sincePoof / 14) * 50;
            const x = Math.cos(angle) * dist;
            const y2 = Math.sin(angle) * dist;
            const opacity = 1 - sincePoof / 14;
            return (
              <circle
                key={i}
                cx={x}
                cy={y2}
                r="6"
                fill={theme.colors.shibaCream}
                opacity={opacity}
              />
            );
          })}
        </svg>
      ) : null}
    </div>
  );
};
