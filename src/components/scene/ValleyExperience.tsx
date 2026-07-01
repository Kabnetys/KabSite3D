"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { useChapterNavigation } from "@/hooks/useChapterNavigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { isWebGLAvailable } from "@/lib/webgl";
import { Minimap } from "./Minimap";
import { ChapterTransitions } from "./ChapterTransitions";
import { TextVersion } from "@/components/ui/TextVersion";
import { TextVersionToggle } from "@/components/ui/TextVersionToggle";

const Scene = dynamic(() => import("./Scene").then((mod) => mod.Scene), {
  ssr: false,
});

const SCROLL_CHAPTERS = 6;

function getInitialWebglAvailable(): boolean {
  return isWebGLAvailable();
}

export function ValleyExperience() {
  const [webglAvailable] = useState(getInitialWebglAvailable);
  const [showTextVersion, setShowTextVersion] = useState(false);
  const scrollProgress = useScrollProgress();
  const reducedMotion = useReducedMotion();
  const { goToChapter } = useChapterNavigation(scrollProgress);

  useLenisScroll();

  if (!webglAvailable || showTextVersion) {
    return (
      <TextVersion
        onClose={webglAvailable ? () => setShowTextVersion(false) : undefined}
      />
    );
  }

  return (
    <div className="relative">
      <div className="fixed inset-0 z-0">
        <Scene scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
      </div>
      <ChapterTransitions scrollProgress={scrollProgress} />
      <Minimap scrollProgress={scrollProgress} onSelect={goToChapter} />
      <TextVersionToggle onClick={() => setShowTextVersion(true)} />
      <div style={{ height: `${SCROLL_CHAPTERS * 100}vh` }} aria-hidden="true" />
    </div>
  );
}
