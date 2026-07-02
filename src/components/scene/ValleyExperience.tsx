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
import { ColorWash } from "./ColorWash";
import { TextVersion } from "@/components/ui/TextVersion";
import { TextVersionToggle } from "@/components/ui/TextVersionToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { SceneTheme } from "@/lib/theme";

const THEME_STORAGE_KEY = "kabsite3d-theme";

const Scene = dynamic(() => import("./Scene").then((mod) => mod.Scene), {
  ssr: false,
});

const SCROLL_CHAPTERS = 6;

function getInitialWebglAvailable(): boolean {
  return isWebGLAvailable();
}

function getInitialTheme(): SceneTheme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" || stored === "light" ? stored : "dark";
}

export function ValleyExperience() {
  const [webglAvailable] = useState(getInitialWebglAvailable);
  const [showTextVersion, setShowTextVersion] = useState(false);
  const [theme, setTheme] = useState<SceneTheme>(getInitialTheme);
  const scrollProgress = useScrollProgress();
  const reducedMotion = useReducedMotion();
  const { goToChapter } = useChapterNavigation(scrollProgress);

  useLenisScroll();

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  };

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
        <Scene scrollProgress={scrollProgress} reducedMotion={reducedMotion} theme={theme} />
      </div>
      <ColorWash scrollProgress={scrollProgress} theme={theme} />
      <ChapterTransitions scrollProgress={scrollProgress} />
      <Minimap scrollProgress={scrollProgress} onSelect={goToChapter} />
      <TextVersionToggle onClick={() => setShowTextVersion(true)} />
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <div style={{ height: `${SCROLL_CHAPTERS * 100}vh` }} aria-hidden="true" />
    </div>
  );
}
