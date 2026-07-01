import { useCallback, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Color, Mesh, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, Texture } from "three";
import {
  DEFAULT_VALLEY_CONFIG,
  buildGroundGeometry,
  computeValleyConfigForRange,
} from "@/lib/valleyTerrain";
import { getChapterZRange } from "@/lib/chapters";
import { getLightColorAt } from "@/lib/chapterAppearance";
import type { MouseParallax } from "@/hooks/useMouseParallax";

const NEUTRAL_ROCK = new Color("#ffffff");
const TERRAIN_TINT_STRENGTH = 0.07;
const TEXTURE_REPEAT_X = 24;
const TEXTURE_REPEAT_Z = 48;

interface ValleyTerrainProps {
  segments: number;
  reducedMotion: boolean;
  mouse: MutableRefObject<MouseParallax>;
  scrollProgress: number;
}

const CAMERA_MARGIN = 60;
const tintColor = new Color();

export function ValleyTerrain({ segments, reducedMotion, mouse, scrollProgress }: ValleyTerrainProps) {
  const groundRef = useRef<Mesh>(null);
  const groundMaterialRef = useRef<MeshStandardMaterial>(null);

  const config = useMemo(() => {
    const { min, max } = getChapterZRange();
    const ranged = computeValleyConfigForRange(
      DEFAULT_VALLEY_CONFIG,
      min,
      max,
      CAMERA_MARGIN
    );
    return {
      ...ranged,
      widthSegments: segments,
      lengthSegments: segments,
    };
  }, [segments]);

  const groundGeometry = useMemo(() => buildGroundGeometry(config), [config]);

  const repeatZ = (TEXTURE_REPEAT_Z * config.length) / config.width;

  const configureTextures = useCallback(
    (textures: Texture[]) => {
      textures.forEach((texture, index) => {
        if (index === 0) texture.colorSpace = SRGBColorSpace;
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(TEXTURE_REPEAT_X, repeatZ);
        texture.anisotropy = 8;
        texture.needsUpdate = true;
      });
    },
    [repeatZ]
  );

  const [diffuseMap, normalMap, roughnessMap] = useTexture(
    [
      "/textures/rock/rock-diffuse.webp",
      "/textures/rock/rock-normal.webp",
      "/textures/rock/rock-roughness.webp",
    ],
    configureTextures
  );

  useFrame(() => {
    if (groundMaterialRef.current) {
      tintColor.copy(NEUTRAL_ROCK).lerp(getLightColorAt(scrollProgress), TERRAIN_TINT_STRENGTH);
      groundMaterialRef.current.color.copy(tintColor);
    }
    if (reducedMotion || !groundRef.current) return;
    const tiltX = mouse.current.y * 0.01;
    const tiltZ = -mouse.current.x * 0.01;
    groundRef.current.rotation.x += (tiltX - groundRef.current.rotation.x) * 0.02;
    groundRef.current.rotation.z += (tiltZ - groundRef.current.rotation.z) * 0.02;
  });

  return (
    <>
      <mesh ref={groundRef} geometry={groundGeometry} position={[0, 0, config.centerZ]} receiveShadow>
        <meshStandardMaterial
          ref={groundMaterialRef}
          map={diffuseMap}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          roughness={0.96}
          metalness={0.03}
        />
      </mesh>
    </>
  );
}
