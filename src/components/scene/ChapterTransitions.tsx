"use client";

import { useMemo } from "react";
import { CHAPTERS } from "@/lib/chapters";

interface ChapterTransitionsProps {
  scrollProgress: number;
}

type TransitionKind = "fadeBlack" | "flashWhite";

interface TransitionZone {
  kind: TransitionKind;
  start: number;
  end: number;
}

const TRANSITION_WIDTH = 0.02;

function buildTransitionZones(): TransitionZone[] {
  const kinds: TransitionKind[] = [
    "fadeBlack",
    "flashWhite",
    "flashWhite",
    "fadeBlack",
    "flashWhite",
  ];
  return CHAPTERS.slice(1).map((chapter, i) => ({
    kind: kinds[i] ?? "fadeBlack",
    start: chapter.scrollProgress - TRANSITION_WIDTH,
    end: chapter.scrollProgress + TRANSITION_WIDTH,
  }));
}

function triangularOpacity(progress: number, zone: TransitionZone): number {
  if (progress < zone.start || progress > zone.end) return 0;
  const mid = (zone.start + zone.end) / 2;
  const half = (zone.end - zone.start) / 2;
  return 1 - Math.abs(progress - mid) / half;
}

export function ChapterTransitions({ scrollProgress }: ChapterTransitionsProps) {
  const zones = useMemo(() => buildTransitionZones(), []);

  let blackOpacity = 0;
  let whiteOpacity = 0;

  for (const zone of zones) {
    const opacity = triangularOpacity(scrollProgress, zone);
    if (zone.kind === "fadeBlack") blackOpacity = Math.max(blackOpacity, opacity);
    else whiteOpacity = Math.max(whiteOpacity, opacity);
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      <div
        className="absolute inset-0 bg-black transition-opacity duration-100"
        style={{ opacity: blackOpacity }}
      />
      <div
        className="absolute inset-0 bg-white transition-opacity duration-100"
        style={{ opacity: whiteOpacity * 0.85 }}
      />
    </div>
  );
}
