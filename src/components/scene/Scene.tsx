import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import { DirectionalLight, Mesh, PointLight, Vector3 } from "three";
import { detectPerformanceTier } from "@/lib/devicePerformance";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { getCameraPositionAt, getLookAtPositionAt } from "@/lib/cameraPath";
import { ValleyTerrain } from "./ValleyTerrain";
import { ValleyAtmosphere } from "./ValleyAtmosphere";
import { ValleyWater } from "./ValleyWater";
import { Moon } from "./Moon";
import { AppMockupModel } from "./AppMockupModel";
import { CameraRig } from "./CameraRig";
import { THEME_PALETTES, type SceneTheme } from "@/lib/theme";
import { computePanelTransformAtProgress } from "@/lib/chapterPanels";
import { getLightColorAt, getLightIntensityAt } from "@/lib/chapterAppearance";

// The story text now lives in the screen-space HTML overlay
// (src/components/ui/ChapterOverlay.tsx), hubtown.co.in-style -- the 3D
// scene is purely the cinematic background. Only the app mockup remains as
// an in-world 3D accent near the Intelligence chapter.
const INTELLIGENCE_PEAK_PROGRESS = 0.58;
const APP_MOCKUP_TRANSFORM = computePanelTransformAtProgress(INTELLIGENCE_PEAK_PROGRESS, 9, -3, 0.5);

interface SceneProps {
  scrollProgress: number;
  reducedMotion: boolean;
  theme: SceneTheme;
}

interface RimLightProps {
  scrollProgress: number;
  theme: SceneTheme;
}

const camPos = new Vector3();

function RimLight({ scrollProgress, theme }: RimLightProps) {
  const lightRef = useRef<DirectionalLight>(null);
  const palette = THEME_PALETTES[theme];

  useFrame(() => {
    if (!lightRef.current) return;
    getCameraPositionAt(scrollProgress, camPos);
    lightRef.current.position.set(camPos.x - 60, camPos.y + 90, camPos.z + 40);
    lightRef.current.target.position.set(camPos.x, camPos.y - 5, camPos.z - 60);
    lightRef.current.target.updateMatrixWorld();

    // Dark mode carries the storyboard's per-chapter mood light; light mode
    // stays a fixed daylight sun regardless of chapter.
    if (theme === "dark") {
      lightRef.current.color.copy(getLightColorAt(scrollProgress));
      lightRef.current.intensity = getLightIntensityAt(scrollProgress) * 0.12;
    } else {
      lightRef.current.color.set(palette.sunColor);
      lightRef.current.intensity = palette.sunIntensity;
    }
  });

  return <directionalLight ref={lightRef} castShadow={false} />;
}

interface TravelingLightProps {
  scrollProgress: number;
  theme: SceneTheme;
}

// hubtown.co.in's signature: the scene stays mostly dark, and one bright,
// near-white light travels ahead of the camera, revealing the rock as it
// passes. Point light (no shadows, cheap) + a small additive glow core so
// the source itself reads as a luminous orb in the distance.
const TRAVEL_LIGHT_AHEAD = 26;
const TRAVEL_LIGHT_LIFT = 4;

const travelCamPos = new Vector3();
const travelLookAt = new Vector3();
const travelForward = new Vector3();
const travelTarget = new Vector3();

function TravelingLight({ scrollProgress, theme }: TravelingLightProps) {
  const lightRef = useRef<PointLight>(null);
  const coreRef = useRef<Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (!lightRef.current) return;
    getCameraPositionAt(scrollProgress, travelCamPos);
    getLookAtPositionAt(scrollProgress, travelLookAt);
    travelForward.subVectors(travelLookAt, travelCamPos);
    if (travelForward.lengthSq() < 1e-4) {
      travelForward.set(0, 0, -1);
    } else {
      travelForward.normalize();
    }
    travelTarget.copy(travelCamPos).addScaledVector(travelForward, TRAVEL_LIGHT_AHEAD);
    travelTarget.y += TRAVEL_LIGHT_LIFT;

    const smoothing = 1 - Math.exp(-4 * delta);
    lightRef.current.position.lerp(travelTarget, smoothing);

    const flicker = 1 + Math.sin(clock.elapsedTime * 2.3) * 0.06;
    lightRef.current.intensity = (theme === "dark" ? 42 : 0) * flicker;

    if (coreRef.current) {
      coreRef.current.position.copy(lightRef.current.position);
      coreRef.current.visible = theme === "dark";
      const scale = 1 + Math.sin(clock.elapsedTime * 1.7) * 0.12;
      coreRef.current.scale.setScalar(scale);
    }
  });

  return (
    <>
      <pointLight ref={lightRef} color="#eaf4ff" distance={70} decay={1.7} intensity={0} />
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#f4faff" toneMapped={false} fog={false} />
      </mesh>
    </>
  );
}

export function Scene({ scrollProgress, reducedMotion, theme }: SceneProps) {
  const performanceTier = useMemo(() => detectPerformanceTier(), []);
  const highQuality = performanceTier === "high";
  const segments = highQuality ? 120 : 70;
  const mouse = useMouseParallax(!reducedMotion);
  const palette = THEME_PALETTES[theme];

  return (
    <Canvas
      dpr={highQuality ? [1, 1.75] : [1, 1]}
      gl={{ antialias: highQuality }}
      camera={{ fov: 62, near: 0.1, far: 900 }}
    >
      <color attach="background" args={[palette.background]} />
      <ambientLight intensity={palette.ambientIntensity} color={palette.ambientColor} />
      <hemisphereLight
        args={[palette.hemisphereSky, palette.hemisphereGround, palette.hemisphereIntensity]}
      />
      <RimLight scrollProgress={scrollProgress} theme={theme} />
      <TravelingLight scrollProgress={scrollProgress} theme={theme} />
      <ValleyAtmosphere scrollProgress={scrollProgress} theme={theme} />
      <Moon theme={theme} />
      <Suspense fallback={null}>
        <ValleyTerrain segments={segments} scrollProgress={scrollProgress} theme={theme} />
      </Suspense>
      <Suspense fallback={null}>
        <ValleyWater scrollProgress={scrollProgress} theme={theme} />
      </Suspense>
      <Suspense fallback={null}>
        <group
          position={APP_MOCKUP_TRANSFORM.position}
          rotation={[0, APP_MOCKUP_TRANSFORM.rotationY, 0]}
        >
          <AppMockupModel />
        </group>
      </Suspense>
      <CameraRig scrollProgress={scrollProgress} reducedMotion={reducedMotion} mouse={mouse} />
    </Canvas>
  );
}
