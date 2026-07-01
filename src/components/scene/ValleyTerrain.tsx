import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Mesh, MeshStandardMaterial } from "three";
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
      <mesh ref={groundRef} geometry={groundGeometry} position={[0, 0, config.centerZ]}>
        <meshStandardMaterial
          ref={groundMaterialRef}
          color="#4a453d"
          roughness={0.96}
          metalness={0.03}
        />
      </mesh>
    </>
  );
}
