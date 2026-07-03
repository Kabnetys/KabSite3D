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
// A second, sparser cloud of slightly larger points sits in front of the
// main field -- cheap depth cue (varied apparent size/brightness) instead
// of a single uniform layer of identical dots, without any extra per-frame
// vertex work.
const BRIGHT_STAR_COUNT = 140;

function buildStarPositions(count: number): Float32Array {
  const { min, max } = getChapterZRange();
  const zStart = max + STAR_MARGIN;
  const zSpan = max - min + STAR_MARGIN * 2;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 500;
    positions[i * 3 + 1] = 30 + Math.random() * 140;
    positions[i * 3 + 2] = zStart - Math.random() * zSpan;
  }
  return positions;
}

export function ValleyAtmosphere({ scrollProgress, theme }: ValleyAtmosphereProps) {
  const fogRef = useRef<FogExp2>(null);
  const starsRef = useRef<Points>(null);
  const brightStarsRef = useRef<Points>(null);
  const starPositions = useMemo(() => buildStarPositions(STAR_COUNT), []);
  const brightStarPositions = useMemo(() => buildStarPositions(BRIGHT_STAR_COUNT), []);
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
    const opacity = theme === "light" ? 0 : getStarOpacityAt(scrollProgress);
    if (starsRef.current) {
      const material = starsRef.current.material as import("three").PointsMaterial;
      material.opacity = opacity;
    }
    if (brightStarsRef.current) {
      const material = brightStarsRef.current.material as import("three").PointsMaterial;
      material.opacity = opacity * 0.85;
    }
  });

  return (
    <>
      <fogExp2 ref={fogRef} attach="fog" args={["#2a1a4a", 0.028]} />
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[starPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#dfeaff" size={0.45} transparent opacity={0} sizeAttenuation fog={false} />
      </points>
      <points ref={brightStarsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[brightStarPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#f4f9ff" size={1.15} transparent opacity={0} sizeAttenuation fog={false} />
      </points>
    </>
  );
}
