import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import { DirectionalLight } from "three";
import { detectPerformanceTier } from "@/lib/devicePerformance";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { getCameraPositionAt } from "@/lib/cameraPath";
import { ValleyTerrain } from "./ValleyTerrain";
import { ValleyAtmosphere } from "./ValleyAtmosphere";
import { HeadlightBeacon } from "./HeadlightBeacon";
import { CameraRig } from "./CameraRig";
import { Vector3 } from "three";

interface SceneProps {
  scrollProgress: number;
  reducedMotion: boolean;
}

interface RimLightProps {
  scrollProgress: number;
}

const camPos = new Vector3();

function RimLight({ scrollProgress }: RimLightProps) {
  const lightRef = useRef<DirectionalLight>(null);

  useFrame(() => {
    if (!lightRef.current) return;
    getCameraPositionAt(scrollProgress, camPos);
    lightRef.current.position.set(camPos.x - 60, camPos.y + 90, camPos.z + 40);
    lightRef.current.target.position.set(camPos.x, camPos.y - 5, camPos.z - 60);
    lightRef.current.target.updateMatrixWorld();
  });

  return <directionalLight ref={lightRef} color="#dce8ff" intensity={1.4} castShadow={false} />;
}

export function Scene({ scrollProgress, reducedMotion }: SceneProps) {
  const performanceTier = useMemo(() => detectPerformanceTier(), []);
  const highQuality = performanceTier === "high";
  const segments = highQuality ? 90 : 60;
  const mouse = useMouseParallax(!reducedMotion);

  return (
    <Canvas
      dpr={highQuality ? [1, 1.5] : [1, 1]}
      gl={{ antialias: highQuality }}
      camera={{ fov: 62, near: 0.1, far: 900 }}
    >
      <color attach="background" args={["#040d1a"]} />
      <ambientLight intensity={0.16} color="#8a8478" />
      <hemisphereLight args={["#00b4ff", "#1a1712", 0.24]} />
      <RimLight scrollProgress={scrollProgress} />
      <ValleyAtmosphere scrollProgress={scrollProgress} />
      <Suspense fallback={null}>
        <ValleyTerrain
          segments={segments}
          reducedMotion={reducedMotion}
          mouse={mouse}
          scrollProgress={scrollProgress}
        />
      </Suspense>
      <HeadlightBeacon
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
        mouse={mouse}
      />
      <CameraRig scrollProgress={scrollProgress} reducedMotion={reducedMotion} mouse={mouse} />
    </Canvas>
  );
}
