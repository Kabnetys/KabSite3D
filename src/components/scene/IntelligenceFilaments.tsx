import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Group, Vector3 } from "three";
import { CHAPTERS } from "@/lib/chapters";
import { valleyHeightAt, DEFAULT_VALLEY_CONFIG } from "@/lib/valleyTerrain";

interface IntelligenceFilamentsProps {
  scrollProgress: number;
}

const CHAPTER_INDEX = 3;
const FILAMENT_COUNT = 14;

function buildFilamentGeometries(): BufferGeometry[] {
  const chapter = CHAPTERS[CHAPTER_INDEX];
  const baseZ = chapter.position[2];
  const geometries: BufferGeometry[] = [];

  for (let i = 0; i < FILAMENT_COUNT; i += 1) {
    const offsetX = (i - FILAMENT_COUNT / 2) * 1.6;
    const points: Vector3[] = [];
    for (let s = 0; s <= 20; s += 1) {
      const z = baseZ + 40 - s * 4;
      const x = offsetX + Math.sin(s * 0.4 + i) * 1.2;
      const y =
        valleyHeightAt(x, z, DEFAULT_VALLEY_CONFIG) + 0.15 + Math.sin(s * 0.6 + i * 2) * 0.05;
      points.push(new Vector3(x, y, z));
    }
    geometries.push(new BufferGeometry().setFromPoints(points));
  }

  return geometries;
}

export function IntelligenceFilaments({ scrollProgress }: IntelligenceFilamentsProps) {
  const groupRef = useRef<Group>(null);
  const geometries = useMemo(() => buildFilamentGeometries(), []);
  const chapter = CHAPTERS[CHAPTER_INDEX];
  const nextChapter = CHAPTERS[CHAPTER_INDEX + 1];

  useFrame(() => {
    if (!groupRef.current) return;
    const inRange =
      scrollProgress >= chapter.scrollProgress - 0.03 &&
      scrollProgress < (nextChapter?.scrollProgress ?? 1);
    groupRef.current.visible = inRange;
  });

  return (
    <group ref={groupRef}>
      {geometries.map((geometry, i) => (
        <line key={`filament-${i}`}>
          <primitive object={geometry} attach="geometry" />
          <lineBasicMaterial color="#2266ff" transparent opacity={0.75} />
        </line>
      ))}
    </group>
  );
}
