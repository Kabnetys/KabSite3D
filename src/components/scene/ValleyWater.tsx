import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  BufferAttribute,
  Color,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
} from "three";
import { createNoise2D } from "simplex-noise";
import { CHAPTERS } from "@/lib/chapters";
import { valleyHeightAt, DEFAULT_VALLEY_CONFIG } from "@/lib/valleyTerrain";

interface ValleyWaterProps {
  scrollProgress: number;
}

const HORIZON_CHAPTER_INDEX = 5;
const WATER_WIDTH = 2200;
// The plane only covers z <= WATER_NEAR_Z through WATER_FAR_Z, so mounting
// it at t=0 never exposes water under the earlier valley -- there is simply
// no water geometry there to show through the trough. WATER_NEAR_Z is kept
// aligned with the rock's edge-falloff end (see valleyTerrain.ts) so the
// water plane never overlaps the zone where the rock ridge is still
// partway through tapering down -- otherwise patches of water peek through
// dips in the not-yet-fully-flattened terrain before the actual reveal.
const WATER_NEAR_Z = -335;
const WATER_FAR_Z = -900;
const WATER_LENGTH = WATER_NEAR_Z - WATER_FAR_Z;
const WATER_CENTER_Z = (WATER_NEAR_Z + WATER_FAR_Z) / 2;
const WATER_LEVEL_OFFSET = 8.5;
const WATER_SEGMENTS = 72;
const NORMAL_RECOMPUTE_INTERVAL = 2;
const TEXTURE_REPEAT = 16;
const FLOW_SPEED_X = 0.05;
const FLOW_SPEED_Y = 0.08;
const WAVE_NOISE = createNoise2D(() => 0.61);
const DETAIL_NOISE = createNoise2D(() => 0.34);

const BASE_COLOR = new Color("#0a1c4a");
const CREST_COLOR = new Color("#1c4f9c");

function buildWaterGeometry(): PlaneGeometry {
  const geometry = new PlaneGeometry(
    WATER_WIDTH,
    WATER_LENGTH,
    WATER_SEGMENTS,
    WATER_SEGMENTS
  );
  geometry.rotateX(-Math.PI / 2);
  const colors = new Float32Array((geometry.attributes.position.count) * 3);
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  return geometry;
}

export function ValleyWater(_props: ValleyWaterProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const geometry = useMemo(() => buildWaterGeometry(), []);
  const basePositions = useMemo(() => {
    const position = geometry.attributes.position as BufferAttribute;
    return Float32Array.from(position.array);
  }, [geometry]);
  const frameCount = useRef(0);
  const workColor = useMemo(() => new Color(), []);

  const [normalMap] = useTexture(["/textures/water/water-normal.webp"], (textures) => {
    textures.forEach((texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(TEXTURE_REPEAT, TEXTURE_REPEAT);
      texture.needsUpdate = true;
    });
  });

  const horizonChapter = CHAPTERS[HORIZON_CHAPTER_INDEX];
  const waterLevelZ = horizonChapter.position[2] - 20;
  const waterLevel = valleyHeightAt(0, waterLevelZ, DEFAULT_VALLEY_CONFIG) + WATER_LEVEL_OFFSET;

  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current) return;

    // Always mounted and rendered: the rock geometry itself stops well
    // before the water's footprint, so it stays naturally hidden beneath
    // the terrain everywhere except the Horizon finale where the rock ends.
    meshRef.current.visible = true;
    materialRef.current.opacity = 1;
    materialRef.current.emissiveIntensity = 0.16 + Math.sin(clock.elapsedTime * 0.8) * 0.05;

    const time = clock.elapsedTime;
    if (normalMap) {
      normalMap.offset.set(time * FLOW_SPEED_X, time * FLOW_SPEED_Y);
    }

    const meshGeometry = meshRef.current.geometry;
    const position = meshGeometry.attributes.position as BufferAttribute;
    const colorAttr = meshGeometry.attributes.color as BufferAttribute;
    for (let i = 0; i < position.count; i += 1) {
      const x = basePositions[i * 3];
      const z = basePositions[i * 3 + 2];
      const wave =
        Math.sin(x * 0.14 + time * 0.75) * 0.45 +
        Math.sin(z * 0.1 - time * 0.55) * 0.55 +
        Math.sin((x + z) * 0.06 + time * 0.35) * 0.3 +
        WAVE_NOISE(x * 0.045 + time * 0.1, z * 0.045 - time * 0.06) * 0.7 +
        DETAIL_NOISE(x * 0.2 + time * 0.2, z * 0.2) * 0.15;
      position.setY(i, wave);

      const crestT = Math.min(1, Math.max(0, (wave + 0.6) / 1.8));
      workColor.copy(BASE_COLOR).lerp(CREST_COLOR, crestT);
      colorAttr.setXYZ(i, workColor.r, workColor.g, workColor.b);
    }
    position.needsUpdate = true;
    colorAttr.needsUpdate = true;

    frameCount.current += 1;
    if (frameCount.current % NORMAL_RECOMPUTE_INTERVAL === 0) {
      meshGeometry.computeVertexNormals();
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, waterLevel, WATER_CENTER_Z]}>
      <meshStandardMaterial
        ref={materialRef}
        vertexColors
        normalMap={normalMap}
        normalScale={[1.4, 1.4]}
        emissive="#123a7a"
        emissiveIntensity={0.16}
        roughness={0.32}
        metalness={0.35}
        transparent
        opacity={1}
      />
    </mesh>
  );
}
