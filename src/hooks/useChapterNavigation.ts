import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { CHAPTERS, getActiveChapterIndex, getChapterBySlug } from "@/lib/chapters";
import { useReducedMotion } from "./useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollToPlugin);
}

function getScrollTargetForProgress(progress: number): number {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return progress * maxScroll;
}

export function useChapterNavigation(scrollProgress: number) {
  const reducedMotion = useReducedMotion();
  const lastSyncedSlug = useRef<string | null>(null);

  useEffect(() => {
    const activeIndex = getActiveChapterIndex(scrollProgress);
    const slug = CHAPTERS[activeIndex].slug;
    if (lastSyncedSlug.current === slug) return;
    lastSyncedSlug.current = slug;
    const url = `${window.location.pathname}#${slug}`;
    window.history.replaceState(null, "", url);
  }, [scrollProgress]);

  const goToChapter = useCallback(
    (slug: string) => {
      const chapter = getChapterBySlug(slug);
      if (!chapter) return;
      const target = getScrollTargetForProgress(chapter.scrollProgress);

      if (reducedMotion) {
        window.scrollTo({ top: target, behavior: "auto" });
        return;
      }

      gsap.to(window, {
        scrollTo: { y: target },
        duration: 1.4,
        ease: "power2.inOut",
      });
    },
    [reducedMotion]
  );

  const goToOffset = useCallback(
    (offset: number) => {
      const activeIndex = getActiveChapterIndex(scrollProgress);
      const nextIndex = Math.min(
        CHAPTERS.length - 1,
        Math.max(0, activeIndex + offset)
      );
      goToChapter(CHAPTERS[nextIndex].slug);
    },
    [scrollProgress, goToChapter]
  );

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        goToOffset(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        goToOffset(-1);
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [goToOffset]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const chapter = getChapterBySlug(hash);
    if (!chapter) return;
    const raf = requestAnimationFrame(() => {
      const target = getScrollTargetForProgress(chapter.scrollProgress);
      window.scrollTo({ top: target, behavior: "auto" });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return { goToChapter, goToOffset };
}
