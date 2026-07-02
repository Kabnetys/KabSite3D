import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, Mesh, MeshStandardMaterial, PlaneGeometry } from "three";
import { createNoise2D } from "simplex-noise";
import { getChapterZRange } from "@/lib/chapters";

const PANORAMA_WIDTH = 1600;
const PANORAMA_LENGTH = 500;
const PANORAMA_SEGMENTS = 24;
const PANORAMA_MARGIN = 20;
const NORMAL_RECOMPUTE_INTERVAL = 4;
const WAVE_NOISE = createNoise2D(() => 0.71);

function buildPanoramaGeometry(): PlaneGeometry {
  const geometry = new PlaneGeometry(
    PANORAMA_WIDTH,
    PANORAMA_LENGTH,
    PANORAMA_SEGMENTS,
    PANORAMA_SEGMENTS
  );
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

export function DistantPanorama() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const frameCount = useRef(0);
  const geometry = useMemo(() => buildPanoramaGeometry(), []);
  const basePositions = useMemo(() => {
    const position = geometry.attributes.position as BufferAttribute;
    return Float32Array.from(position.array);
  }, [geometry]);

  const { min } = getChapterZRange();
  const panoramaCenterZ = min - PANORAMA_MARGIN - PANORAMA_LENGTH / 2;
  const panoramaLevel = -12;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const meshGeometry = meshRef.current.geometry;
    const position = meshGeometry.attributes.position as BufferAttribute;
    const time = clock.elapsedTime;
    for (let i = 0; i < position.count; i += 1) {
      const x = basePositions[i * 3];
      const z = basePositions[i * 3 + 2];
      const wave =
        Math.sin(x * 0.02 + time * 0.25) * 1.2 +
        Math.sin(z * 0.015 - time * 0.18) * 1.4 +
        WAVE_NOISE(x * 0.01 + time * 0.03, z * 0.01) * 1.6;
      position.setY(i, wave);
    }
    position.needsUpdate = true;
    frameCount.current += 1;
    if (frameCount.current % NORMAL_RECOMPUTE_INTERVAL === 0) {
      meshGeometry.computeVertexNormals();
    }
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.4 + Math.sin(time * 0.3) * 0.08;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, panoramaLevel, panoramaCenterZ]}>
      <meshStandardMaterial
        ref={materialRef}
        color="#05123a"
        emissive="#0f2e6b"
        emissiveIntensity={0.4}
        roughness={0.1}
        metalness={0.9}
        fog={false}
      />
    </mesh>
  );
}
