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

const TRANSITION_WIDTH = 0.06;
const MAX_BLACK_OPACITY = 0.5;
const MAX_WHITE_OPACITY = 0.2;

function buildTransitionZones(): TransitionZone[] {
  const kinds: TransitionKind[] = [
    "fadeBlack",
    "flashWhite",
    "fadeBlack",
    "fadeBlack",
    "fadeBlack",
  ];
  return CHAPTERS.slice(1).map((chapter, i) => ({
    kind: kinds[i] ?? "fadeBlack",
    start: chapter.scrollProgress - TRANSITION_WIDTH,
    end: chapter.scrollProgress + TRANSITION_WIDTH,
  }));
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function triangularOpacity(progress: number, zone: TransitionZone): number {
  if (progress < zone.start || progress > zone.end) return 0;
  const mid = (zone.start + zone.end) / 2;
  const half = (zone.end - zone.start) / 2;
  const linear = 1 - Math.abs(progress - mid) / half;
  return smoothstep(Math.min(1, Math.max(0, linear)));
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
        style={{ opacity: blackOpacity * MAX_BLACK_OPACITY }}
      />
      <div
        className="absolute inset-0 bg-white transition-opacity duration-100"
        style={{ opacity: whiteOpacity * MAX_WHITE_OPACITY }}
      />
    </div>
  );
}
