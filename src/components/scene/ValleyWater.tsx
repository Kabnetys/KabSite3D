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
import { THEME_PALETTES, type SceneTheme } from "@/lib/theme";

interface ValleyWaterProps {
  scrollProgress: number;
  theme: SceneTheme;
}

const HORIZON_CHAPTER_INDEX = 5;
const WATER_WIDTH = 2200;
// The plane covers z <= WATER_NEAR_Z through WATER_FAR_Z. WATER_NEAR_Z
// overlaps the rock's edge-falloff zone (see valleyTerrain.ts) on purpose:
// per-vertex alpha (below) masks the water out wherever the real terrain
// height at that vertex is still above the waterline, so the water's edge
// follows the canyon's actual contour instead of being a straight
// rectangular cut across it.
const WATER_NEAR_Z = -312;
const WATER_FAR_Z = -900;
const WATER_LENGTH = WATER_NEAR_Z - WATER_FAR_Z;
const WATER_CENTER_Z = (WATER_NEAR_Z + WATER_FAR_Z) / 2;
const WATER_LEVEL_OFFSET = 3;
// Kept tight: a wide soft margin lets the noisy, not-yet-fully-tapered rock
// surface dip in and out of the threshold in many small unrelated spots,
// showing up as scattered translucent blotches across the rock face
// instead of one clean shoreline.
const SHORE_ALPHA_MARGIN = 1.2;
const WATER_SEGMENTS = 72;
const NORMAL_RECOMPUTE_INTERVAL = 2;
const TEXTURE_REPEAT = 16;
const FLOW_SPEED_X = 0.05;
const FLOW_SPEED_Y = 0.08;
const WAVE_NOISE = createNoise2D(() => 0.61);
const DETAIL_NOISE = createNoise2D(() => 0.34);

const WATER_LEVEL_Z = CHAPTERS[HORIZON_CHAPTER_INDEX].position[2] - 20;
const WATER_LEVEL = valleyHeightAt(0, WATER_LEVEL_Z, DEFAULT_VALLEY_CONFIG) + WATER_LEVEL_OFFSET;

function buildWaterGeometry(): PlaneGeometry {
  const geometry = new PlaneGeometry(
    WATER_WIDTH,
    WATER_LENGTH,
    WATER_SEGMENTS,
    WATER_SEGMENTS
  );
  geometry.rotateX(-Math.PI / 2);

  const position = geometry.attributes.position as BufferAttribute;
  const vertexCount = position.count;
  // RGBA: rgb is re-written every frame for the wave-crest tint, alpha is
  // baked once here from the real terrain contour so the shoreline follows
  // the canyon shape instead of the plane's rectangular boundary.
  const colors = new Float32Array(vertexCount * 4);
  for (let i = 0; i < vertexCount; i += 1) {
    const worldX = position.getX(i);
    const worldZ = position.getZ(i) + WATER_CENTER_Z;
    const terrainHeight = valleyHeightAt(worldX, worldZ, DEFAULT_VALLEY_CONFIG);
    const submerged = WATER_LEVEL - terrainHeight;
    const alpha = Math.min(
      1,
      Math.max(0, (submerged + SHORE_ALPHA_MARGIN) / (SHORE_ALPHA_MARGIN * 2))
    );
    colors[i * 4] = 1;
    colors[i * 4 + 1] = 1;
    colors[i * 4 + 2] = 1;
    colors[i * 4 + 3] = alpha;
  }
  geometry.setAttribute("color", new BufferAttribute(colors, 4));
  return geometry;
}

export function ValleyWater({ theme }: ValleyWaterProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const geometry = useMemo(() => buildWaterGeometry(), []);
  const basePositions = useMemo(() => {
    const position = geometry.attributes.position as BufferAttribute;
    return Float32Array.from(position.array);
  }, [geometry]);
  const frameCount = useRef(0);
  const workColor = useMemo(() => new Color(), []);
  const baseColor = useMemo(() => new Color(), []);
  const crestColor = useMemo(() => new Color(), []);
  const palette = THEME_PALETTES[theme];
  baseColor.set(palette.waterBase);
  crestColor.set(palette.waterCrest);

  const [normalMap] = useTexture(["/textures/water/water-normal.webp"], (textures) => {
    textures.forEach((texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(TEXTURE_REPEAT, TEXTURE_REPEAT);
      texture.needsUpdate = true;
    });
  });

  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current) return;

    // Always fully loaded and rendered from t=0: the per-vertex alpha mask
    // (baked in buildWaterGeometry from the real terrain contour) already
    // keeps it invisible everywhere the rock sits above the waterline, so
    // no scroll-driven fade is needed on top of it.
    meshRef.current.visible = true;
    materialRef.current.opacity = 1;
    materialRef.current.emissive.set(palette.waterEmissive);
    materialRef.current.emissiveIntensity =
      palette.waterEmissiveIntensity + Math.sin(clock.elapsedTime * 0.8) * 0.05 * (theme === "dark" ? 1 : 0.2);

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
      workColor.copy(baseColor).lerp(crestColor, crestT);
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
    <mesh ref={meshRef} geometry={geometry} position={[0, WATER_LEVEL, WATER_CENTER_Z]}>
      <meshStandardMaterial
        ref={materialRef}
        vertexColors
        normalMap={normalMap}
        normalScale={[1.1, 1.1]}
        emissive={palette.waterEmissive}
        emissiveIntensity={palette.waterEmissiveIntensity}
        roughness={0.18}
        metalness={0.55}
        transparent
        opacity={1}
      />
    </mesh>
  );
}
