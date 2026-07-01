import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { PALETTE } from "@/lib/palette";
import { DISTRICTS } from "@/lib/districts";
import { detectPerformanceTier } from "@/lib/devicePerformance";
import { CityDistrict } from "./CityDistrict";
import { CityGround } from "./CityGround";
import { CameraRig } from "./CameraRig";
import { PostFX } from "./PostFX";

interface SceneProps {
  scrollProgress: number;
  reducedMotion: boolean;
}

export function Scene({ scrollProgress, reducedMotion }: SceneProps) {
  const performanceTier = useMemo(() => detectPerformanceTier(), []);
  const highQuality = performanceTier === "high";

  return (
    <Canvas
      dpr={highQuality ? [1, 1.75] : [1, 1]}
      gl={{ antialias: highQuality }}
      shadows={highQuality}
      camera={{ fov: 55, near: 0.1, far: 500 }}
    >
      <color attach="background" args={[PALETTE.background]} />
      <fog attach="fog" args={[PALETTE.background, 20, 140]} />
      <ambientLight intensity={0.08} color={PALETTE.primary} />
      <hemisphereLight args={[PALETTE.neon, PALETTE.background, 0.22]} />
      <directionalLight
        position={[-40, 60, 20]}
        intensity={0.5}
        color="#a9c8ff"
        castShadow={highQuality}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      <CityGround />
      {DISTRICTS.map((district, index) => (
        <CityDistrict key={district.id} district={district} index={index} />
      ))}
      <CameraRig scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
      <PostFX highQuality={highQuality} />
    </Canvas>
  );
}
