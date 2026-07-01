import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { PointLight, Vector3 } from "three";
import { getCameraPositionAt, getLookAtPositionAt } from "@/lib/cameraPath";
import { getLightColorAt, getLightIntensityAt } from "@/lib/chapterAppearance";
import type { MouseParallax } from "@/hooks/useMouseParallax";

interface HeadlightBeaconProps {
  scrollProgress: number;
  reducedMotion: boolean;
  mouse: MutableRefObject<MouseParallax>;
}

const BEACON_DISTANCE = 30;

export function HeadlightBeacon({ scrollProgress, reducedMotion, mouse }: HeadlightBeaconProps) {
  const lightRef = useRef<PointLight>(null);
  const cameraPos = useRef(new Vector3());
  const lookAtPos = useRef(new Vector3());
  const direction = useRef(new Vector3());
  const targetPos = useRef(new Vector3());
  const lateralOffset = useRef(0);

  useFrame((_, delta) => {
    if (!lightRef.current) return;

    getCameraPositionAt(scrollProgress, cameraPos.current);
    getLookAtPositionAt(scrollProgress, lookAtPos.current);
    direction.current.subVectors(lookAtPos.current, cameraPos.current);
    if (direction.current.lengthSq() < 1e-4) {
      direction.current.set(0, 0, -1);
    } else {
      direction.current.normalize();
    }
    targetPos.current.copy(cameraPos.current).addScaledVector(direction.current, BEACON_DISTANCE);

    const smoothing = reducedMotion ? 1 : 1 - Math.exp(-4 * delta);
    lightRef.current.position.lerp(targetPos.current, smoothing);

    if (!reducedMotion) {
      const desiredOffset = mouse.current.x * 1.5;
      lateralOffset.current += (desiredOffset - lateralOffset.current) * (1 - Math.exp(-1.2 * delta));
      lightRef.current.position.x += lateralOffset.current;
    }

    lightRef.current.color.copy(getLightColorAt(scrollProgress));
    lightRef.current.intensity = getLightIntensityAt(scrollProgress);
  });

  return (
    <pointLight
      ref={lightRef}
      distance={90}
      decay={1.6}
      color="#6a5acd"
      intensity={6}
    />
  );
}
