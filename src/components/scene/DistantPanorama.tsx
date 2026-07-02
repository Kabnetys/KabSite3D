import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  Color,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
} from "three";
import { createNoise2D } from "simplex-noise";
import { getChapterZRange } from "@/lib/chapters";

const PANORAMA_WIDTH = 1600;
const PANORAMA_LENGTH = 500;
const PANORAMA_SEGMENTS = 24;
const PANORAMA_MARGIN = 20;
const NORMAL_RECOMPUTE_INTERVAL = 4;
const WAVE_NOISE = createNoise2D(() => 0.71);

const BACKDROP_WIDTH = 3200;
const BACKDROP_HEIGHT = 600;
const BACKDROP_SEGMENTS = 24;
const WATER_COLOR = new Color("#123a7a");
// Matches the Canvas's own background color exactly (see Scene.tsx) so the
// top of the backdrop blends away instead of showing as a visible seam.
const SKY_COLOR = new Color("#040d1a");
// How far down from the top (as a fraction of height) the color/alpha
// finishes fading into the canvas background, so the plane's edges dissolve
// instead of reading as a hard rectangular frame.
const TOP_FADE_FRACTION = 0.35;

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

function buildBackdropGeometry(): PlaneGeometry {
  const geometry = new PlaneGeometry(BACKDROP_WIDTH, BACKDROP_HEIGHT, 1, BACKDROP_SEGMENTS);
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 4);
  const color = new Color();
  for (let i = 0; i < position.count; i += 1) {
    const y = position.getY(i);
    const t = Math.min(1, Math.max(0, (y + BACKDROP_HEIGHT / 2) / BACKDROP_HEIGHT));
    color.copy(WATER_COLOR).lerp(SKY_COLOR, t);
    const fadeT = Math.min(1, Math.max(0, (t - (1 - TOP_FADE_FRACTION)) / TOP_FADE_FRACTION));
    const alpha = 1 - fadeT;
    colors[i * 4] = color.r;
    colors[i * 4 + 1] = color.g;
    colors[i * 4 + 2] = color.b;
    colors[i * 4 + 3] = alpha;
  }
  geometry.setAttribute("color", new BufferAttribute(colors, 4));
  return geometry;
}

export function DistantPanorama() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const frameCount = useRef(0);
  const geometry = useMemo(() => buildPanoramaGeometry(), []);
  const backdropGeometry = useMemo(() => buildBackdropGeometry(), []);
  const basePositions = useMemo(() => {
    const position = geometry.attributes.position as BufferAttribute;
    return Float32Array.from(position.array);
  }, [geometry]);

  const { min } = getChapterZRange();
  const panoramaCenterZ = min - PANORAMA_MARGIN - PANORAMA_LENGTH / 2;
  const panoramaLevel = -12;
  const backdropZ = panoramaCenterZ - PANORAMA_LENGTH / 2 - 1;
  const backdropY = panoramaLevel + BACKDROP_HEIGHT / 2 - 20;

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
    <>
      <mesh geometry={backdropGeometry} position={[0, backdropY, backdropZ]} renderOrder={-1}>
        <meshBasicMaterial
          ref={(material: MeshBasicMaterial | null) => {
            if (material) material.fog = false;
          }}
          vertexColors
          fog={false}
          transparent
          depthWrite={false}
        />
      </mesh>
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
    </>
  );
}
