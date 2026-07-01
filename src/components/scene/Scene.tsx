import { Canvas } from "@react-three/fiber";
import { PALETTE } from "@/lib/palette";
import { DISTRICTS } from "@/lib/districts";
import { CityDistrict } from "./CityDistrict";
import { CityGround } from "./CityGround";
import { CameraRig } from "./CameraRig";

interface SceneProps {
  scrollProgress: number;
  reducedMotion: boolean;
}

export function Scene({ scrollProgress, reducedMotion }: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true }}
      camera={{ fov: 55, near: 0.1, far: 500 }}
    >
      <color attach="background" args={[PALETTE.background]} />
      <fog attach="fog" args={[PALETTE.background, 20, 140]} />
      <ambientLight intensity={0.15} color={PALETTE.primary} />
      <hemisphereLight
        args={[PALETTE.neon, PALETTE.background, 0.3]}
      />
      <CityGround />
      {DISTRICTS.map((district, index) => (
        <CityDistrict key={district.id} district={district} index={index} />
      ))}
      <CameraRig scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
