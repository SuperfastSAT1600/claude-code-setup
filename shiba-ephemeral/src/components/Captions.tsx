import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import {
  createTikTokStyleCaptions,
  type Caption,
  type TikTokPage,
} from "@remotion/captions";
import { theme } from "../Theme";
import type { SceneId } from "../Theme";

const STROKE_COLOR = theme.colors.captionStroke;
const STROKE_WIDTH_PX = theme.caption.strokeWidthPx;
const FONT_SIZE_PX = theme.caption.fontSizePx;
const COMBINE_WINDOW_MS = theme.caption.combineWindowMs;
const ACTIVE_COLOR = theme.colors.amber;
const INACTIVE_COLOR = theme.colors.captionInactive;
const FONT_FAMILY = theme.fonts.body;
const TOP_PCT = theme.caption.topPct;
const BOTTOM_PCT = theme.caption.bottomPct;

const buildTextShadow = (color: string, width: number): string => {
  const offsets: string[] = [];
  for (let dx = -width; dx <= width; dx++) {
    for (let dy = -width; dy <= width; dy++) {
      if (dx === 0 && dy === 0) continue;
      offsets.push(`${dx}px ${dy}px 0 ${color}`);
    }
  }
  return offsets.join(", ");
};

const TEXT_SHADOW = buildTextShadow(STROKE_COLOR, STROKE_WIDTH_PX);
const SUPER_TEXT_SHADOW = buildTextShadow(STROKE_COLOR, STROKE_WIDTH_PX + 2);

const StandardPage: React.FC<{ page: TikTokPage; playbackRate: number }> = ({
  page,
  playbackRate,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000 * playbackRate;
  const absoluteTimeMs = page.startMs + currentTimeMs;

  return (
    <AbsoluteFill
      style={{
        top: `${TOP_PCT * 100}%`,
        bottom: `${(1 - BOTTOM_PCT) * 100}%`,
        height: "auto",
        justifyContent: "flex-start",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 900,
          fontSize: FONT_SIZE_PX,
          lineHeight: 1.1,
          // pre-wrap so the leading space inside each token is preserved AND
          // long lines wrap at the maxWidth instead of overflowing the viewport.
          whiteSpace: "pre-wrap",
          textAlign: "center",
          textShadow: TEXT_SHADOW,
          maxWidth: "90%",
        }}
      >
        {page.tokens.map((token) => {
          const isActive =
            token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
          return (
            <span
              key={`${token.fromMs}-${token.toMs}`}
              style={{
                color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
                textShadow: isActive
                  ? `${TEXT_SHADOW}, 0 0 26px ${ACTIVE_COLOR}, 0 0 12px ${ACTIVE_COLOR}cc`
                  : TEXT_SHADOW,
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const SupersizedPage: React.FC<{ page: TikTokPage; playbackRate: number }> = ({
  page,
  playbackRate,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000 * playbackRate;
  const absoluteTimeMs = page.startMs + currentTimeMs;
  const bounce = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        transform: `scale(${0.6 + bounce * 0.5})`,
      }}
    >
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 900,
          fontSize: FONT_SIZE_PX * 1.6,
          lineHeight: 1.1,
          whiteSpace: "pre-wrap",
          textAlign: "center",
          textShadow: SUPER_TEXT_SHADOW,
          maxWidth: "92%",
          letterSpacing: "0.01em",
        }}
      >
        {page.tokens.map((token) => {
          const isActive =
            token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
          const isKeyword = /^\s*EPHEMERAL/i.test(token.text);
          const color = isKeyword
            ? ACTIVE_COLOR
            : isActive
              ? ACTIVE_COLOR
              : INACTIVE_COLOR;
          return (
            <span
              key={`${token.fromMs}-${token.toMs}`}
              style={{
                color,
                textShadow: isKeyword
                  ? `${SUPER_TEXT_SHADOW}, 0 0 40px ${ACTIVE_COLOR}, 0 0 20px ${ACTIVE_COLOR}cc`
                  : isActive
                    ? `${SUPER_TEXT_SHADOW}, 0 0 26px ${ACTIVE_COLOR}, 0 0 12px ${ACTIVE_COLOR}cc`
                    : SUPER_TEXT_SHADOW,
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Captions: React.FC<{
  // String rather than SceneId so we can mount additional caption ids like
  // "scene7a" / "scene7b" that aren't real scenes but reuse the JSON pipeline.
  captionsId: SceneId | string;
  playbackRate?: number;
  supersized?: boolean;
  // When set, drop tokens whose toMs <= trimBeforeMs, then shift surviving
  // tokens by -trimBeforeMs so they start near 0. Used to render the back
  // half of a single VO's captions later in the timeline.
  trimBeforeMs?: number;
  // When set, drop tokens whose fromMs >= trimAfterMs. Used to render the
  // front half of a VO's captions and stop before a later phrase.
  trimAfterMs?: number;
}> = ({
  captionsId,
  playbackRate = 1,
  supersized = false,
  trimBeforeMs,
  trimAfterMs,
}) => {
  const { fps } = useVideoConfig();
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const [missing, setMissing] = useState(false);

  const fetchCaptions = useCallback(async () => {
    try {
      const response = await fetch(staticFile(`captions/${captionsId}.json`));
      if (!response.ok) {
        setMissing(true);
        continueRender(handle);
        return;
      }
      const data = (await response.json()) as Caption[];
      setCaptions(data);
      continueRender(handle);
    } catch (e) {
      console.warn(`[Captions] failed to load ${captionsId}.json`, e);
      setMissing(true);
      try {
        continueRender(handle);
      } catch (err) {
        cancelRender(err);
      }
    }
  }, [captionsId, continueRender, cancelRender, handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  const pages = useMemo<TikTokPage[]>(() => {
    if (!captions || captions.length === 0) return [];
    let working = captions;
    if (trimAfterMs !== undefined) {
      working = working.filter((c) => c.startMs < trimAfterMs);
    }
    if (trimBeforeMs !== undefined) {
      working = working
        .filter((c) => c.endMs > trimBeforeMs)
        .map((c) => ({
          ...c,
          startMs: Math.max(0, c.startMs - trimBeforeMs),
          endMs: Math.max(0, c.endMs - trimBeforeMs),
          timestampMs:
            c.timestampMs === null
              ? null
              : Math.max(0, c.timestampMs - trimBeforeMs),
        }));
    }
    if (working.length === 0) return [];
    const result = createTikTokStyleCaptions({
      captions: working,
      combineTokensWithinMilliseconds: supersized ? 2400 : COMBINE_WINDOW_MS,
    });
    return result.pages;
  }, [captions, supersized, trimBeforeMs, trimAfterMs]);

  if (missing || !captions || pages.length === 0) {
    return null;
  }

  const Page = supersized ? SupersizedPage : StandardPage;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const startFrame = (page.startMs / 1000 / playbackRate) * fps;
        const endFrame = nextPage
          ? (nextPage.startMs / 1000 / playbackRate) * fps
          : startFrame +
            ((supersized ? 2400 : COMBINE_WINDOW_MS) / 1000 / playbackRate) *
              fps;
        const durationInFrames = Math.max(1, Math.round(endFrame - startFrame));

        return (
          <Sequence
            key={`${page.startMs}-${index}`}
            from={Math.round(startFrame)}
            durationInFrames={durationInFrames}
            layout="none"
          >
            <Page page={page} playbackRate={playbackRate} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
