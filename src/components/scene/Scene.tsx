import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import { DirectionalLight } from "three";
import { detectPerformanceTier } from "@/lib/devicePerformance";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { getCameraPositionAt } from "@/lib/cameraPath";
import { ValleyTerrain } from "./ValleyTerrain";
import { ValleyAtmosphere } from "./ValleyAtmosphere";
import { HeadlightBeacon } from "./HeadlightBeacon";
import { IntelligenceFilaments } from "./IntelligenceFilaments";
import { CameraRig } from "./CameraRig";
import { PostFX } from "./PostFX";
import { Vector3 } from "three";

interface SceneProps {
  scrollProgress: number;
  reducedMotion: boolean;
}

interface RimLightProps {
  scrollProgress: number;
  castShadow: boolean;
}

const camPos = new Vector3();

function RimLight({ scrollProgress, castShadow }: RimLightProps) {
  const lightRef = useRef<DirectionalLight>(null);

  useFrame(() => {
    if (!lightRef.current) return;
    getCameraPositionAt(scrollProgress, camPos);
    lightRef.current.position.set(camPos.x - 60, camPos.y + 90, camPos.z + 40);
    lightRef.current.target.position.set(camPos.x, camPos.y - 5, camPos.z - 60);
    lightRef.current.target.updateMatrixWorld();
  });

  return (
    <directionalLight
      ref={lightRef}
      color="#dce8ff"
      intensity={1.4}
      castShadow={castShadow}
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.0015}
    />
  );
}

export function Scene({ scrollProgress, reducedMotion }: SceneProps) {
  const performanceTier = useMemo(() => detectPerformanceTier(), []);
  const highQuality = performanceTier === "high";
  const segments = highQuality ? 140 : 80;
  const mouse = useMouseParallax(!reducedMotion);

  return (
    <Canvas
      dpr={highQuality ? [1, 1.75] : [1, 1]}
      gl={{ antialias: highQuality }}
      shadows={highQuality}
      camera={{ fov: 62, near: 0.1, far: 600 }}
    >
      <color attach="background" args={["#040d1a"]} />
      <ambientLight intensity={0.1} color="#1565c0" />
      <hemisphereLight args={["#00b4ff", "#040d1a", 0.18]} />
      <RimLight scrollProgress={scrollProgress} castShadow={highQuality} />
      <ValleyAtmosphere scrollProgress={scrollProgress} />
      <ValleyTerrain segments={segments} reducedMotion={reducedMotion} mouse={mouse} />
      <IntelligenceFilaments scrollProgress={scrollProgress} />
      <HeadlightBeacon
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
        mouse={mouse}
      />
      <CameraRig scrollProgress={scrollProgress} reducedMotion={reducedMotion} mouse={mouse} />
      <PostFX highQuality={highQuality} />
    </Canvas>
  );
}
