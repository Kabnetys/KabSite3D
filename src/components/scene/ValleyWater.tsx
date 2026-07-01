import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from "three";
import { createNoise2D } from "simplex-noise";
import { CHAPTERS, getChapterBlend } from "@/lib/chapters";
import { valleyHeightAt, DEFAULT_VALLEY_CONFIG } from "@/lib/valleyTerrain";

interface ValleyWaterProps {
  scrollProgress: number;
}

const HORIZON_CHAPTER_INDEX = 5;
const WATER_WIDTH = 900;
const WATER_LENGTH = 700;
const WATER_SEGMENTS = 56;
const WATER_RISE_DISTANCE = 14;
const NORMAL_RECOMPUTE_INTERVAL = 3;
const WAVE_NOISE = createNoise2D(() => 0.61);

function buildWaterGeometry(): PlaneGeometry {
  const geometry = new PlaneGeometry(
    WATER_WIDTH,
    WATER_LENGTH,
    WATER_SEGMENTS,
    WATER_SEGMENTS
  );
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

export function ValleyWater({ scrollProgress }: ValleyWaterProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const geometry = useMemo(() => buildWaterGeometry(), []);
  const basePositions = useMemo(() => {
    const position = geometry.attributes.position as BufferAttribute;
    return Float32Array.from(position.array);
  }, [geometry]);
  const frameCount = useRef(0);

  const horizonChapter = CHAPTERS[HORIZON_CHAPTER_INDEX];
  const waterCenterZ = horizonChapter.position[2] - 20;
  const waterLevel = valleyHeightAt(0, waterCenterZ, DEFAULT_VALLEY_CONFIG) + 1.5;

  useFrame(({ clock }) => {
    const { index, t } = getChapterBlend(scrollProgress);
    const waterVisibility = index >= HORIZON_CHAPTER_INDEX - 1 ? (index === HORIZON_CHAPTER_INDEX - 1 ? t : 1) : 0;

    if (!meshRef.current || !materialRef.current) return;

    const isVisible = waterVisibility > 0.001;
    meshRef.current.visible = isVisible;
    if (!isVisible) return;

    materialRef.current.opacity = Math.min(1, waterVisibility * 1.6);
    meshRef.current.position.y = waterLevel - (1 - waterVisibility) * WATER_RISE_DISTANCE;

    const meshGeometry = meshRef.current.geometry;
    const position = meshGeometry.attributes.position as BufferAttribute;
    const time = clock.elapsedTime;
    for (let i = 0; i < position.count; i += 1) {
      const x = basePositions[i * 3];
      const z = basePositions[i * 3 + 2];
      const wave =
        Math.sin(x * 0.12 + time * 0.6) * 0.35 +
        Math.sin(z * 0.09 - time * 0.45) * 0.4 +
        WAVE_NOISE(x * 0.04 + time * 0.08, z * 0.04) * 0.5;
      position.setY(i, wave);
    }
    position.needsUpdate = true;

    frameCount.current += 1;
    if (frameCount.current % NORMAL_RECOMPUTE_INTERVAL === 0) {
      meshGeometry.computeVertexNormals();
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, waterLevel, waterCenterZ]}>
      <meshStandardMaterial
        ref={materialRef}
        color="#0a1c4a"
        emissive="#123a7a"
        emissiveIntensity={0.55}
        roughness={0.05}
        metalness={0.95}
        transparent
        opacity={0}
      />
    </mesh>
  );
}
