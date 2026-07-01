import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import {
  DEFAULT_VALLEY_CONFIG,
  buildGroundGeometry,
  buildSkyGeometry,
  computeValleyConfigForRange,
} from "@/lib/valleyTerrain";
import { getChapterZRange } from "@/lib/chapters";
import type { MouseParallax } from "@/hooks/useMouseParallax";

interface ValleyTerrainProps {
  segments: number;
  reducedMotion: boolean;
  mouse: MutableRefObject<MouseParallax>;
}

const CAMERA_MARGIN = 120;

export function ValleyTerrain({ segments, reducedMotion, mouse }: ValleyTerrainProps) {
  const groundRef = useRef<Mesh>(null);

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
  const skyGeometry = useMemo(() => buildSkyGeometry(config), [config]);

  useFrame(() => {
    if (reducedMotion || !groundRef.current) return;
    const tiltX = mouse.current.y * 0.01;
    const tiltZ = -mouse.current.x * 0.01;
    groundRef.current.rotation.x += (tiltX - groundRef.current.rotation.x) * 0.02;
    groundRef.current.rotation.z += (tiltZ - groundRef.current.rotation.z) * 0.02;
  });

  return (
    <>
      <mesh ref={groundRef} geometry={groundGeometry} position={[0, 0, 0]} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh geometry={skyGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial color="#05040a" roughness={1} metalness={0} side={2} />
      </mesh>
    </>
  );
}
