"use client";

import { getPanelVisibility } from "@/lib/chapters";
import { SCENARIO_BEATS, type ScenarioBeat } from "@/lib/scenario";
import type { SceneTheme } from "@/lib/theme";

interface ChapterOverlayProps {
  scrollProgress: number;
  theme: SceneTheme;
}

// hubtown.co.in-style content layer: the story text is a fixed, screen-space
// HTML overlay (real website typography) that fades/slides with the scroll,
// while the 3D valley plays behind it. Text never lives inside the 3D world.

const ALIGN_CLASSES: Record<ScenarioBeat["align"], string> = {
  left: "items-start text-left left-[7vw] right-auto",
  right: "items-end text-right right-[7vw] left-auto",
  center: "items-center text-center left-1/2 -translate-x-1/2",
};

function Beat({
  beat,
  visibility,
  theme,
}: {
  beat: ScenarioBeat;
  visibility: number;
  theme: SceneTheme;
}) {
  if (visibility < 0.015) return null;

  const eased = visibility * visibility * (3 - 2 * visibility);
  const translate = (1 - eased) * 28;
  const dark = theme === "dark";

  const eyebrowColor = dark ? "text-[#7cd9ff]" : "text-[#0f5f7a]";
  const textColor = dark ? "text-[#f2f7ff]" : "text-[#0c1a26]";
  const noteColor = dark ? "text-[#9db4cc]" : "text-[#3d5568]";
  const statGlow = dark
    ? { textShadow: "0 0 60px rgba(110,200,255,0.55), 0 0 18px rgba(150,220,255,0.35)" }
    : undefined;

  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 flex max-w-[min(80vw,640px)] flex-col gap-4 ${ALIGN_CLASSES[beat.align]}`}
      style={{
        opacity: eased,
        transform: `translateY(calc(-50% + ${translate}px))${beat.align === "center" ? " translateX(-50%)" : ""}`,
      }}
    >
      {beat.eyebrow ? (
        <p
          className={`text-[0.7rem] font-medium uppercase tracking-[0.35em] md:text-xs ${eyebrowColor}`}
        >
          {beat.eyebrow}
        </p>
      ) : null}

      {beat.stat ? (
        <p
          className={`text-[clamp(4.5rem,12vw,9rem)] font-semibold leading-none tracking-tight ${textColor}`}
          style={statGlow}
        >
          {beat.stat}
        </p>
      ) : null}

      <h2
        className={`${
          beat.stat
            ? "text-[clamp(1.1rem,2.2vw,1.6rem)] font-normal"
            : "text-[clamp(2rem,5.5vw,4.2rem)] font-semibold leading-[1.08] tracking-tight"
        } ${textColor}`}
      >
        {beat.lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>

      {beat.note ? (
        <p className={`max-w-md text-sm leading-relaxed md:text-base ${noteColor}`}>{beat.note}</p>
      ) : null}
    </div>
  );
}

export function ChapterOverlay({ scrollProgress, theme }: ChapterOverlayProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {SCENARIO_BEATS.map((beat) => (
        <Beat
          key={beat.id}
          beat={beat}
          visibility={getPanelVisibility(scrollProgress, beat.peakProgress, beat.fadeHalfWidth)}
          theme={theme}
        />
      ))}
    </div>
  );
}
