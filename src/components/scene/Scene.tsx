import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { detectPerformanceTier } from "@/lib/devicePerformance";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { ValleyTerrain } from "./ValleyTerrain";
import { ValleyAtmosphere } from "./ValleyAtmosphere";
import { HeadlightBeacon } from "./HeadlightBeacon";
import { IntelligenceFilaments } from "./IntelligenceFilaments";
import { CameraRig } from "./CameraRig";
import { PostFX } from "./PostFX";

interface SceneProps {
  scrollProgress: number;
  reducedMotion: boolean;
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
      <ambientLight intensity={0.16} color="#1565c0" />
      <hemisphereLight args={["#00b4ff", "#040d1a", 0.32]} />
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
