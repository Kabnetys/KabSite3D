import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Group, LineBasicMaterial, Vector3 } from "three";
import { getChapterZRange } from "@/lib/chapters";
import { valleyHeightAt, DEFAULT_VALLEY_CONFIG } from "@/lib/valleyTerrain";

interface ValleyFilamentsProps {
  scrollProgress: number;
}

const STRAND_COUNT = 10;
const SEGMENTS_PER_STRAND = 60;
const STRAND_LATERAL_SPAN = 1.4;
const PULSE_SPEED = 3.2;
const PULSE_WIDTH = 0.18;

interface StrandData {
  geometry: BufferGeometry;
  zValues: number[];
  offsetX: number;
}

function buildStrands(): StrandData[] {
  const { min, max } = getChapterZRange();
  const zStart = max + 20;
  const zEnd = min - 20;
  const strands: StrandData[] = [];

  for (let i = 0; i < STRAND_COUNT; i += 1) {
    const offsetX = (i - (STRAND_COUNT - 1) / 2) * STRAND_LATERAL_SPAN;
    const points: Vector3[] = [];
    const zValues: number[] = [];
    for (let s = 0; s <= SEGMENTS_PER_STRAND; s += 1) {
      const t = s / SEGMENTS_PER_STRAND;
      const z = zStart + (zEnd - zStart) * t;
      const x = offsetX + Math.sin(t * 12 + i) * 0.6;
      const y = valleyHeightAt(x, z, DEFAULT_VALLEY_CONFIG) + 0.18;
      points.push(new Vector3(x, y, z));
      zValues.push(z);
    }
    strands.push({ geometry: new BufferGeometry().setFromPoints(points), zValues, offsetX });
  }

  return strands;
}

export function ValleyFilaments({ scrollProgress }: ValleyFilamentsProps) {
  const groupRef = useRef<Group>(null);
  const strands = useMemo(() => buildStrands(), []);
  const materialRefs = useRef<LineBasicMaterial[]>([]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const { min, max } = getChapterZRange();
    const span = max - min + 40;
    const phase = scrollProgress * PULSE_SPEED + clock.elapsedTime * 0.08;

    strands.forEach((strand, i) => {
      const material = materialRefs.current[i];
      if (!material) return;
      const midZ = strand.zValues[Math.floor(strand.zValues.length / 2)];
      const normalizedZ = (max + 20 - midZ) / span;
      const pulse = 0.5 + 0.5 * Math.sin((normalizedZ - phase) / PULSE_WIDTH);
      material.opacity = 0.15 + pulse * 0.55;
    });
  });

  return (
    <group ref={groupRef}>
      {strands.map((strand, i) => (
        <line key={`filament-${i}`}>
          <primitive object={strand.geometry} attach="geometry" />
          <lineBasicMaterial
            ref={(material) => {
              if (material) materialRefs.current[i] = material;
            }}
            color="#00b4ff"
            transparent
            opacity={0.4}
          />
        </line>
      ))}
    </group>
  );
}
