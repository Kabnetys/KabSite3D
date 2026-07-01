"use client";

import { getColorGradeAt } from "@/lib/chapterAppearance";

interface ColorWashProps {
  scrollProgress: number;
}

const WASH_OPACITY = 0.28;

export function ColorWash({ scrollProgress }: ColorWashProps) {
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
