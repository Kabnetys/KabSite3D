import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { FogExp2, Points } from "three";
import { getAppearanceAt, getFogColorAt, getFogDensityAt } from "@/lib/chapterAppearance";
import { getChapterZRange } from "@/lib/chapters";

interface ValleyAtmosphereProps {
  scrollProgress: number;
}

const STAR_COUNT = 400;
const STAR_MARGIN = 120;

function buildStarPositions(): Float32Array {
  const { min, max } = getChapterZRange();
  const zStart = max + STAR_MARGIN;
  const zSpan = max - min + STAR_MARGIN * 2;
  const positions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 300;
    positions[i * 3 + 1] = 40 + Math.random() * 60;
    positions[i * 3 + 2] = zStart - Math.random() * zSpan;
  }
  return positions;
}

export function ValleyAtmosphere({ scrollProgress }: ValleyAtmosphereProps) {
  const fogRef = useRef<FogExp2>(null);
  const starsRef = useRef<Points>(null);
  const starPositions = useMemo(() => buildStarPositions(), []);

  useFrame(() => {
    if (fogRef.current) {
      fogRef.current.color.copy(getFogColorAt(scrollProgress));
      fogRef.current.density = getFogDensityAt(scrollProgress);
    }
    const appearance = getAppearanceAt(scrollProgress);
    if (starsRef.current) {
      const material = starsRef.current.material as import("three").PointsMaterial;
      material.opacity = appearance.hasStars ? 0.85 : 0;
    }
  });

  return (
    <>
      <fogExp2 ref={fogRef} attach="fog" args={["#2a1a4a", 0.028]} />
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#e8f4ff" size={0.6} transparent opacity={0} sizeAttenuation />
      </points>
    </>
  );
}
