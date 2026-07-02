"use client";

import { getColorGradeAt } from "@/lib/chapterAppearance";
import type { SceneTheme } from "@/lib/theme";

interface ColorWashProps {
  scrollProgress: number;
  theme: SceneTheme;
}

const WASH_OPACITY = 0.28;

export function ColorWash({ scrollProgress, theme }: ColorWashProps) {
  // The per-chapter mood grading is tuned for the night palette; daylight
  // stays clean and consistent instead of picking up the same tinted wash.
  if (theme === "light") return null;

  const grade = getColorGradeAt(scrollProgress);
  const tintHex = `#${grade.tint.getHexString()}`;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 transition-colors duration-300"
      style={{
        backgroundColor: tintHex,
        opacity: WASH_OPACITY,
        mixBlendMode: "hue",
      }}
    />
  );
}
