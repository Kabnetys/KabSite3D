import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { DISTRICTS, getActiveDistrictIndex, getDistrictBySlug } from "@/lib/districts";
import { useReducedMotion } from "./useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollToPlugin);
}

function getScrollTargetForProgress(progress: number): number {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return progress * maxScroll;
}

export function useDistrictNavigation(scrollProgress: number) {
  const reducedMotion = useReducedMotion();
  const lastSyncedSlug = useRef<string | null>(null);

  useEffect(() => {
    const activeIndex = getActiveDistrictIndex(scrollProgress);
    const slug = DISTRICTS[activeIndex].slug;
    if (lastSyncedSlug.current === slug) return;
    lastSyncedSlug.current = slug;
    const url = `${window.location.pathname}#${slug}`;
    window.history.replaceState(null, "", url);
  }, [scrollProgress]);

  const goToDistrict = useCallback(
    (slug: string) => {
      const district = getDistrictBySlug(slug);
      if (!district) return;
      const target = getScrollTargetForProgress(district.scrollProgress);

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
      const activeIndex = getActiveDistrictIndex(scrollProgress);
      const nextIndex = Math.min(
        DISTRICTS.length - 1,
        Math.max(0, activeIndex + offset)
      );
      goToDistrict(DISTRICTS[nextIndex].slug);
    },
    [scrollProgress, goToDistrict]
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
    const district = getDistrictBySlug(hash);
    if (!district) return;
    const raf = requestAnimationFrame(() => {
      const target = getScrollTargetForProgress(district.scrollProgress);
      window.scrollTo({ top: target, behavior: "auto" });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return { goToDistrict, goToOffset };
}
