import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, FogExp2, Points } from "three";
import { getFogColorAt, getFogDensityAt, getStarOpacityAt } from "@/lib/chapterAppearance";
import { getChapterZRange } from "@/lib/chapters";
import { THEME_PALETTES, type SceneTheme } from "@/lib/theme";

interface ValleyAtmosphereProps {
  scrollProgress: number;
  theme: SceneTheme;
}

const dayFogColor = new Color();

const STAR_COUNT = 900;
const STAR_MARGIN = 250;

function buildStarPositions(): Float32Array {
  const { min, max } = getChapterZRange();
  const zStart = max + STAR_MARGIN;
  const zSpan = max - min + STAR_MARGIN * 2;
  const positions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 500;
    positions[i * 3 + 1] = 30 + Math.random() * 140;
    positions[i * 3 + 2] = zStart - Math.random() * zSpan;
  }
  return positions;
}

export function ValleyAtmosphere({ scrollProgress, theme }: ValleyAtmosphereProps) {
  const fogRef = useRef<FogExp2>(null);
  const starsRef = useRef<Points>(null);
  const starPositions = useMemo(() => buildStarPositions(), []);
  const palette = THEME_PALETTES[theme];

  useFrame(() => {
    if (fogRef.current) {
      if (theme === "light") {
        // Daylight skips the per-chapter moody fog palette entirely for a
        // clear, consistent haze instead of a night-tuned color.
        dayFogColor.set(palette.fogColor);
        fogRef.current.color.copy(dayFogColor);
        fogRef.current.density = palette.fogDensity;
      } else {
        fogRef.current.color.copy(getFogColorAt(scrollProgress));
        fogRef.current.density = getFogDensityAt(scrollProgress);
      }
    }
    if (starsRef.current) {
      const material = starsRef.current.material as import("three").PointsMaterial;
      material.opacity = theme === "light" ? 0 : getStarOpacityAt(scrollProgress);
    }
  });

  return (
    <>
      <fogExp2 ref={fogRef} attach="fog" args={["#2a1a4a", 0.028]} />
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#e8f4ff" size={0.6} transparent opacity={0} sizeAttenuation fog={false} />
      </points>
    </>
  );
}
