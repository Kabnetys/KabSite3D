import { useEffect, useRef } from "react";

export interface MouseParallax {
  x: number;
  y: number;
}

export function useMouseParallax(enabled: boolean) {
  const target = useRef<MouseParallax>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      target.current.x = 0;
      target.current.y = 0;
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = (event.clientY / window.innerHeight) * 2 - 1;
      target.current.x = nx;
      target.current.y = ny;
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [enabled]);

  return target;
}
