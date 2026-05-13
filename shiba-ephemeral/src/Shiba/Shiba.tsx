import { theme } from "../Theme";

// A richly shaded Shiba Inu. Drawn with layered SVG gradients, fur-edge
// strands, soft drop shadow, and per-feature volume shading so the dog reads
// closer to a painted illustration than a flat cartoon. Every named part
// still animates per frame from the props below, so the dog is alive on
// every single frame.

type ShibaProps = {
  frame: number;
  mouthOpen?: number;
  extraBob?: number;
  squash?: number;
  wobbleDeg?: number;
  tailEnergy?: number;
  scale?: number;
};

const blinkScaleY = (frame: number): number => {
  const cycle = frame % 70;
  if (cycle < 4) return 0.1;
  if (cycle < 6) return 0.5;
  return 1;
};

export const Shiba: React.FC<ShibaProps> = ({
  frame,
  mouthOpen = 0,
  extraBob = 0,
  squash = 1,
  wobbleDeg = 0,
  tailEnergy = 1,
  scale = 1,
}) => {
  const bob = Math.sin(frame * 0.26) * 6 + extraBob;
  const breathScaleY = 1 + Math.sin(frame * 0.26 + Math.PI) * 0.04;
  const breathScaleX = 1 + Math.sin(frame * 0.26) * 0.04;

  const leftEarFlick = Math.sin(frame * 0.42) * 6 + Math.sin(frame * 0.13) * 3;
  const rightEarFlick = Math.cos(frame * 0.38) * 6 + Math.sin(frame * 0.17) * 3;

  const tailAngle = Math.sin(frame * 0.55 * tailEnergy) * 35;

  const eyeScaleY = blinkScaleY(frame);

  const m = Math.max(0, Math.min(1, mouthOpen));
  const mouthHeight = 4 + m * 26;
  const tongueOpacity = m;
  const tongueHeight = 6 + m * 12;

  const ink = theme.colors.shibaInk;
  const orange = theme.colors.shibaOrange;
  const cream = theme.colors.shibaCream;
  const pink = theme.colors.pink;

  // Tone helpers for volume shading. The Shiba's orange is the mid-tone;
  // we derive a highlight and a deep shadow off of it.
  const orangeLight = "#F0AE7A";
  const orangeMid = orange;
  const orangeShadow = "#9C5A36";
  const orangeDeep = "#6E3D22";
  const creamLight = "#FFF5DE";
  const creamMid = cream;
  const creamShadow = "#C9B68F";

  // Chest fluff wisps drift with the breath cycle so they look soft, not
  // pasted on.
  const fluffSway = Math.sin(frame * 0.18) * 1.2;

  return (
    <svg
      viewBox="0 0 420 460"
      style={{
        transform: `scale(${scale * squash}) translateY(${bob}px) rotate(${wobbleDeg}deg)`,
        transformOrigin: "50% 70%",
        overflow: "visible",
      }}
    >
      <defs>
        {/* Body volume — light from upper-left, shadow lower-right. */}
        <radialGradient id="bodyGrad" cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor={orangeLight} />
          <stop offset="45%" stopColor={orangeMid} />
          <stop offset="85%" stopColor={orangeShadow} />
          <stop offset="100%" stopColor={orangeDeep} />
        </radialGradient>

        {/* Head volume — same direction, tighter falloff for a rounder face. */}
        <radialGradient id="headGrad" cx="34%" cy="30%" r="78%">
          <stop offset="0%" stopColor={orangeLight} />
          <stop offset="50%" stopColor={orangeMid} />
          <stop offset="88%" stopColor={orangeShadow} />
          <stop offset="100%" stopColor={orangeDeep} />
        </radialGradient>

        {/* Cream face mask volume. */}
        <radialGradient id="snoutGrad" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor={creamLight} />
          <stop offset="60%" stopColor={creamMid} />
          <stop offset="100%" stopColor={creamShadow} />
        </radialGradient>

        {/* Belly cream — softer, more even. */}
        <radialGradient id="bellyGrad" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor={creamLight} />
          <stop offset="70%" stopColor={creamMid} />
          <stop offset="100%" stopColor={creamShadow} />
        </radialGradient>

        {/* Outer ear — top fades darker (shadow inside the ear curl). */}
        <linearGradient id="earOuterGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={orangeLight} />
          <stop offset="70%" stopColor={orangeMid} />
          <stop offset="100%" stopColor={orangeShadow} />
        </linearGradient>

        {/* Pink inner ear with shadow at the base. */}
        <linearGradient id="innerEarGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FFB3C7" />
          <stop offset="60%" stopColor={pink} />
          <stop offset="100%" stopColor="#C66386" />
        </linearGradient>

        {/* Tail — curled, lighter on the outer face, darker on the inside. */}
        <radialGradient id="tailGrad" cx="35%" cy="40%" r="70%">
          <stop offset="0%" stopColor={orangeLight} />
          <stop offset="55%" stopColor={orangeMid} />
          <stop offset="100%" stopColor={orangeShadow} />
        </radialGradient>

        {/* Iris — warm amber with a darker rim. */}
        <radialGradient id="irisGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#A6722E" />
          <stop offset="60%" stopColor="#5C3A18" />
          <stop offset="100%" stopColor="#1B0F06" />
        </radialGradient>

        {/* Wet nose — glossy black with a top sheen. */}
        <radialGradient id="noseGrad" cx="40%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#6E5A50" />
          <stop offset="25%" stopColor="#2A1A12" />
          <stop offset="100%" stopColor="#0A0604" />
        </radialGradient>

        {/* Tongue — bright at the center, deeper at the throat. */}
        <radialGradient id="tongueGrad" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#FFB6C9" />
          <stop offset="60%" stopColor={pink} />
          <stop offset="100%" stopColor="#A84668" />
        </radialGradient>

        {/* Mouth cavity. */}
        <radialGradient id="mouthCavityGrad" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#3A1818" />
          <stop offset="100%" stopColor="#0E0404" />
        </radialGradient>

        {/* Soft drop shadow filter for the whole dog. */}
        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
          <feOffset dx="0" dy="6" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.35" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Fur-edge wobble filter applied to fur clusters for tactile fluff. */}
        <filter id="furEdge" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed="3"
          />
          <feDisplacementMap in="SourceGraphic" scale="2.4" />
        </filter>

        {/* Faint speckled fur shading overlay. */}
        <filter id="furSpeckle">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="2.8"
            numOctaves="2"
            seed="7"
          />
          <feColorMatrix
            values="0 0 0 0 0.15
                    0 0 0 0 0.09
                    0 0 0 0 0.05
                    0 0 0 0.18 0"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      {/* Soft ground shadow — gaussian style, scales with bob so dog reads grounded */}
      <ellipse
        cx="210"
        cy="430"
        rx={92 - bob * 0.7}
        ry={14 - bob * 0.15}
        fill="rgba(0,0,0,0.18)"
        filter="blur(2px)"
      />
      <ellipse
        cx="210"
        cy="432"
        rx={70 - bob * 0.5}
        ry={9 - bob * 0.1}
        fill="rgba(0,0,0,0.22)"
      />

      {/* Tail — drawn first so it sits behind the body */}
      <g transform={`translate(118, 280) rotate(${tailAngle})`}>
        {/* Outer tail curl */}
        <path
          d="M 0 0 C -30 -22, -62 -32, -82 -8 C -94 8, -86 26, -68 26 C -50 26, -28 14, 0 0 Z"
          fill="url(#tailGrad)"
          stroke={ink}
          strokeWidth="3"
        />
        {/* Inner shadow following the curl */}
        <path
          d="M -6 -2 C -28 -16, -54 -22, -68 -6 C -76 6, -68 18, -54 16 C -38 14, -18 6, -6 -2 Z"
          fill={orangeShadow}
          opacity="0.55"
        />
        {/* Cream tail tip with subtle shading */}
        <path
          d="M -70 -2 C -84 4, -84 22, -70 24 C -58 24, -54 14, -60 4 Z"
          fill={creamMid}
          stroke={ink}
          strokeWidth="2"
        />
        <path
          d="M -68 4 C -78 8, -78 20, -68 22 C -62 22, -60 14, -62 8 Z"
          fill={creamLight}
        />
        {/* A few fur tufts on the tail */}
        <path
          d="M -30 -22 Q -34 -28 -38 -22 M -54 -28 Q -58 -34 -62 -28 M -78 -8 Q -84 -10 -86 -4"
          stroke={orangeShadow}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Body */}
      <g transform={`translate(210, 300) scale(${breathScaleX}, ${breathScaleY})`}>
        {/* Underbody shadow (sits behind main body) */}
        <ellipse cx="0" cy="14" rx="112" ry="86" fill={orangeDeep} opacity="0.35" />
        {/* Main body shape */}
        <ellipse cx="0" cy="0" rx="110" ry="90" fill="url(#bodyGrad)" stroke={ink} strokeWidth="4" />
        {/* Top-edge highlight — narrow crescent that catches the light */}
        <path
          d="M -90 -30 C -70 -78, 70 -78, 90 -30"
          stroke={orangeLight}
          strokeWidth="6"
          fill="none"
          opacity="0.5"
        />
        {/* Faint speckled fur shading over the body */}
        <ellipse
          cx="0"
          cy="0"
          rx="108"
          ry="88"
          fill={orangeMid}
          filter="url(#furSpeckle)"
          opacity="0.4"
        />
        {/* Cream belly */}
        <ellipse cx="0" cy="22" rx="68" ry="52" fill="url(#bellyGrad)" />
        {/* Belly inner shadow ring */}
        <ellipse cx="0" cy="20" rx="68" ry="52" fill="none" stroke={creamShadow} strokeWidth="2" opacity="0.6" />
      </g>

      {/* Chest ruff — overlapping fluff wisps at the body/head meeting line */}
      <g transform={`translate(210, ${262 + fluffSway}) `}>
        {/* Soft fluff base */}
        <ellipse cx="0" cy="0" rx="58" ry="18" fill={creamMid} />
        <ellipse cx="0" cy="-4" rx="50" ry="14" fill={creamLight} opacity="0.9" />
        {/* Individual wisps with the fur-edge filter for tactile fluff */}
        <g filter="url(#furEdge)">
          <ellipse cx="-26" cy="-2" rx="18" ry="10" fill={creamLight} stroke={creamShadow} strokeWidth="1.2" />
          <ellipse cx="22" cy="-4" rx="18" ry="10" fill={creamLight} stroke={creamShadow} strokeWidth="1.2" />
          <ellipse cx="0" cy="6" rx="32" ry="12" fill={creamMid} stroke={creamShadow} strokeWidth="1.2" />
          <ellipse cx="-10" cy="-8" rx="12" ry="6" fill={creamLight} opacity="0.95" />
          <ellipse cx="12" cy="-10" rx="10" ry="5" fill={creamLight} opacity="0.95" />
        </g>
        {/* Fur strand strokes radiating outward */}
        <g stroke={creamShadow} strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.7">
          <path d="M -50 -2 Q -56 4 -54 12" />
          <path d="M -36 -10 Q -42 -6 -40 4" />
          <path d="M -18 -14 Q -22 -8 -20 -2" />
          <path d="M 0 -16 L 0 -8" />
          <path d="M 18 -14 Q 22 -8 20 -2" />
          <path d="M 36 -10 Q 42 -6 40 4" />
          <path d="M 50 -2 Q 56 4 54 12" />
        </g>
      </g>

      {/* Back paws */}
      <g>
        {/* Left back paw */}
        <ellipse cx="150" cy="394" rx="24" ry="15" fill={creamShadow} />
        <ellipse cx="148" cy="392" rx="22" ry="14" fill="url(#bellyGrad)" stroke={ink} strokeWidth="3" />
        {/* Toe pads suggestion */}
        <ellipse cx="140" cy="388" rx="3.5" ry="3" fill={creamShadow} opacity="0.65" />
        <ellipse cx="148" cy="386" rx="3.5" ry="3" fill={creamShadow} opacity="0.65" />
        <ellipse cx="156" cy="388" rx="3.5" ry="3" fill={creamShadow} opacity="0.65" />
        {/* Right back paw */}
        <ellipse cx="274" cy="394" rx="24" ry="15" fill={creamShadow} />
        <ellipse cx="272" cy="392" rx="22" ry="14" fill="url(#bellyGrad)" stroke={ink} strokeWidth="3" />
        <ellipse cx="264" cy="388" rx="3.5" ry="3" fill={creamShadow} opacity="0.65" />
        <ellipse cx="272" cy="386" rx="3.5" ry="3" fill={creamShadow} opacity="0.65" />
        <ellipse cx="280" cy="388" rx="3.5" ry="3" fill={creamShadow} opacity="0.65" />
      </g>

      {/* Front paws (subtle bob offset) */}
      <g transform={`translate(0, ${Math.sin(frame * 0.26 + 0.5) * 3})`}>
        <ellipse cx="176" cy="374" rx="22" ry="15" fill={creamShadow} />
        <ellipse cx="174" cy="372" rx="20" ry="14" fill="url(#bellyGrad)" stroke={ink} strokeWidth="3" />
        <ellipse cx="166" cy="368" rx="3.5" ry="3" fill={creamShadow} opacity="0.65" />
        <ellipse cx="174" cy="366" rx="3.5" ry="3" fill={creamShadow} opacity="0.65" />
        <ellipse cx="182" cy="368" rx="3.5" ry="3" fill={creamShadow} opacity="0.65" />
      </g>
      <g transform={`translate(0, ${Math.sin(frame * 0.26 + 1.0) * 4})`}>
        <ellipse cx="248" cy="374" rx="22" ry="15" fill={creamShadow} />
        <ellipse cx="246" cy="372" rx="20" ry="14" fill="url(#bellyGrad)" stroke={ink} strokeWidth="3" />
        <ellipse cx="238" cy="368" rx="3.5" ry="3" fill={creamShadow} opacity="0.65" />
        <ellipse cx="246" cy="366" rx="3.5" ry="3" fill={creamShadow} opacity="0.65" />
        <ellipse cx="254" cy="368" rx="3.5" ry="3" fill={creamShadow} opacity="0.65" />
      </g>

      {/* Head */}
      <g transform={`translate(210, 168)`}>
        {/* Head undershadow */}
        <circle cx="2" cy="6" r="92" fill={orangeDeep} opacity="0.35" />
        {/* Head base with volume gradient */}
        <circle cx="0" cy="0" r="92" fill="url(#headGrad)" stroke={ink} strokeWidth="4" />
        {/* Forehead highlight */}
        <ellipse cx="-20" cy="-50" rx="38" ry="22" fill={orangeLight} opacity="0.45" />
        {/* Fur speckle over head */}
        <circle cx="0" cy="0" r="90" fill={orangeMid} filter="url(#furSpeckle)" opacity="0.35" />

        {/* Ears — drawn before the cream face mask so they sit behind it */}
        <g transform={`translate(-58, -64) rotate(${-18 + leftEarFlick})`}>
          {/* Ear back shadow */}
          <path
            d="M 0 0 L -30 -52 L 16 -32 Z"
            fill={orangeDeep}
            opacity="0.4"
            transform="translate(1, 2)"
          />
          {/* Ear front */}
          <path
            d="M 0 0 L -28 -50 L 14 -30 Z"
            fill="url(#earOuterGrad)"
            stroke={ink}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Inner pink */}
          <path
            d="M -2 -8 L -22 -40 L 8 -26 Z"
            fill="url(#innerEarGrad)"
          />
          {/* Inner ear highlight */}
          <path
            d="M -6 -14 L -16 -32 L 2 -22 Z"
            fill="#FFCEDE"
            opacity="0.55"
          />
          {/* Ear fur tufts at the base */}
          <path
            d="M -2 -2 Q -6 -8 -10 -6 M 8 -6 Q 12 -12 14 -8"
            stroke={ink}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
        </g>
        <g transform={`translate(58, -64) rotate(${18 + rightEarFlick})`}>
          <path
            d="M 0 0 L 30 -52 L -16 -32 Z"
            fill={orangeDeep}
            opacity="0.4"
            transform="translate(1, 2)"
          />
          <path
            d="M 0 0 L 28 -50 L -14 -30 Z"
            fill="url(#earOuterGrad)"
            stroke={ink}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M 2 -8 L 22 -40 L -8 -26 Z"
            fill="url(#innerEarGrad)"
          />
          <path
            d="M 6 -14 L 16 -32 L -2 -22 Z"
            fill="#FFCEDE"
            opacity="0.55"
          />
          <path
            d="M 2 -2 Q 6 -8 10 -6 M -8 -6 Q -12 -12 -14 -8"
            stroke={ink}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />
        </g>

        {/* Cream face mask with volume gradient */}
        <path
          d="M -60 -12 C -60 40, -36 64, 0 64 C 36 64, 60 40, 60 -12 C 60 -12, 30 4, 0 4 C -30 4, -60 -12, -60 -12 Z"
          fill="url(#snoutGrad)"
          stroke={ink}
          strokeWidth="3"
        />
        {/* Snout midline shadow (subtle) */}
        <path
          d="M 0 8 L 0 56"
          stroke={creamShadow}
          strokeWidth="2"
          opacity="0.35"
          fill="none"
        />
        {/* Snout highlight stripe */}
        <path
          d="M -8 14 Q -2 30 -4 56"
          stroke={creamLight}
          strokeWidth="3"
          opacity="0.6"
          fill="none"
        />

        {/* Cheek puffs / brow patches — with shading and fur strokes */}
        <g>
          <ellipse cx="-44" cy="-22" rx="16" ry="9" fill={creamLight} />
          <ellipse cx="-44" cy="-21" rx="16" ry="9" fill="none" stroke={creamShadow} strokeWidth="1" opacity="0.7" />
          <ellipse cx="-44" cy="-18" rx="12" ry="5" fill={creamShadow} opacity="0.35" />
          <ellipse cx="44" cy="-22" rx="16" ry="9" fill={creamLight} />
          <ellipse cx="44" cy="-21" rx="16" ry="9" fill="none" stroke={creamShadow} strokeWidth="1" opacity="0.7" />
          <ellipse cx="44" cy="-18" rx="12" ry="5" fill={creamShadow} opacity="0.35" />
          {/* Fur fringe strokes on cheek edges */}
          <path
            d="M -58 -20 Q -62 -16 -60 -12 M -54 -14 Q -58 -10 -56 -6 M 58 -20 Q 62 -16 60 -12 M 54 -14 Q 58 -10 56 -6"
            stroke={creamShadow}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Brow ridges (subtle shadow above eyes for depth) */}
        <ellipse cx="-26" cy="-16" rx="14" ry="4" fill={orangeShadow} opacity="0.35" />
        <ellipse cx="26" cy="-16" rx="14" ry="4" fill={orangeShadow} opacity="0.35" />

        {/* Eyes — sclera, iris, pupil, catchlights */}
        <g transform={`translate(-26, -8) scale(1, ${eyeScaleY})`}>
          {/* Eye socket shadow */}
          <ellipse cx="0" cy="2" rx="11" ry="9" fill={orangeDeep} opacity="0.4" />
          {/* Sclera (almond-eye dog: very narrow white) */}
          <ellipse cx="0" cy="0" rx="10" ry="9" fill="#FFFFFF" />
          {/* Iris */}
          <circle cx="0" cy="0" r="8" fill="url(#irisGrad)" />
          {/* Pupil */}
          <circle cx="0" cy="0" r="4.5" fill="#0A0604" />
          {/* Specular catchlight */}
          <circle cx="-2.5" cy="-2.5" r="2.2" fill="#FFFFFF" />
          <circle cx="-1.2" cy="-1.2" r="0.7" fill="#FFFFFF" />
          {/* Lower-lid shadow crescent */}
          <path
            d="M -8 1 Q 0 6 8 1"
            stroke={ink}
            strokeWidth="2"
            fill="none"
            opacity="0.55"
          />
          {/* Upper eyelid */}
          <path
            d="M -10 -1 Q 0 -10 10 -1"
            stroke={ink}
            strokeWidth="2.5"
            fill="none"
          />
        </g>
        <g transform={`translate(26, -8) scale(1, ${eyeScaleY})`}>
          <ellipse cx="0" cy="2" rx="11" ry="9" fill={orangeDeep} opacity="0.4" />
          <ellipse cx="0" cy="0" rx="10" ry="9" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="8" fill="url(#irisGrad)" />
          <circle cx="0" cy="0" r="4.5" fill="#0A0604" />
          <circle cx="-2.5" cy="-2.5" r="2.2" fill="#FFFFFF" />
          <circle cx="-1.2" cy="-1.2" r="0.7" fill="#FFFFFF" />
          <path
            d="M -8 1 Q 0 6 8 1"
            stroke={ink}
            strokeWidth="2"
            fill="none"
            opacity="0.55"
          />
          <path
            d="M -10 -1 Q 0 -10 10 -1"
            stroke={ink}
            strokeWidth="2.5"
            fill="none"
          />
        </g>

        {/* Nose — glossy black with sheen and nostrils */}
        <g transform="translate(0, 24)">
          {/* Nose drop shadow on snout */}
          <ellipse cx="0" cy="3" rx="14" ry="7" fill={creamShadow} opacity="0.6" />
          {/* Nose body */}
          <path
            d="M -12 -4 Q 0 -10 12 -4 Q 14 6 0 10 Q -14 6 -12 -4 Z"
            fill="url(#noseGrad)"
            stroke={ink}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Top sheen */}
          <ellipse cx="-3" cy="-3" rx="5" ry="2" fill="#FFFFFF" opacity="0.55" />
          <ellipse cx="3" cy="-2" rx="2" ry="1" fill="#FFFFFF" opacity="0.4" />
          {/* Nostrils */}
          <ellipse cx="-4.5" cy="3" rx="1.6" ry="2.4" fill="#000000" opacity="0.95" />
          <ellipse cx="4.5" cy="3" rx="1.6" ry="2.4" fill="#000000" opacity="0.95" />
          {/* Septum dip */}
          <path d="M 0 6 L 0 10" stroke="#1A0F08" strokeWidth="1.2" />
        </g>

        {/* Mouth — line drops down from nose to a smile/open mouth */}
        <g transform={`translate(0, 34)`}>
          {/* Philtrum line */}
          <path d="M 0 0 L 0 6" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
          {/* Open mouth dark cavity */}
          <ellipse
            cx="0"
            cy={6 + mouthHeight / 2}
            rx={14 + m * 8}
            ry={mouthHeight / 2}
            fill="url(#mouthCavityGrad)"
            opacity="0.98"
          />
          {/* Inner mouth shadow ring */}
          <ellipse
            cx="0"
            cy={6 + mouthHeight / 2}
            rx={14 + m * 8}
            ry={mouthHeight / 2}
            fill="none"
            stroke="#1A0808"
            strokeWidth="1.2"
            opacity={m * 0.8}
          />
          {/* Tongue */}
          <ellipse
            cx="0"
            cy={6 + mouthHeight / 2 + 4}
            rx={10 + m * 4}
            ry={tongueHeight / 2}
            fill="url(#tongueGrad)"
            opacity={tongueOpacity}
          />
          {/* Tongue groove */}
          <path
            d={`M 0 ${6 + mouthHeight / 2 - 2} L 0 ${6 + mouthHeight / 2 + tongueHeight / 2}`}
            stroke="#A84668"
            strokeWidth="1.5"
            opacity={tongueOpacity * 0.8}
          />
          {/* Tongue highlight */}
          <ellipse
            cx="-2"
            cy={6 + mouthHeight / 2 + 1}
            rx="3"
            ry="1.5"
            fill="#FFD4E0"
            opacity={tongueOpacity * 0.9}
          />
          {/* Mouth seam — visible even when closed */}
          <path
            d={`M -14 6 Q -6 ${10 + m * 4}, 0 ${10 + m * 4} Q 6 ${10 + m * 4}, 14 6`}
            fill="none"
            stroke={ink}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* Whiskers — three fine strokes per side, length scales subtly */}
        <g stroke={ink} strokeWidth="1.2" strokeLinecap="round" opacity="0.45" fill="none">
          <path d="M -44 24 Q -54 22 -64 24" />
          <path d="M -44 30 Q -56 30 -66 32" />
          <path d="M -44 36 Q -54 38 -62 42" />
          <path d="M 44 24 Q 54 22 64 24" />
          <path d="M 44 30 Q 56 30 66 32" />
          <path d="M 44 36 Q 54 38 62 42" />
        </g>
      </g>
    </svg>
  );
};
