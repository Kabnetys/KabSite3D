import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import { DirectionalLight, PointLight, Vector3 } from "three";
import { detectPerformanceTier } from "@/lib/devicePerformance";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { getCameraPositionAt, getLookAtPositionAt } from "@/lib/cameraPath";
import { ValleyTerrain } from "./ValleyTerrain";
import { ValleyAtmosphere } from "./ValleyAtmosphere";
import { ValleyWater } from "./ValleyWater";
import { ValleyLightTrail } from "./ValleyLightTrail";
import { TrailSplit } from "./TrailSplit";
import { Moon } from "./Moon";
import { AppMockupModel } from "./AppMockupModel";
import { CameraRig } from "./CameraRig";
import { THEME_PALETTES, type SceneTheme } from "@/lib/theme";
import { getWorldProgress, getSplitPhase } from "@/lib/scrollPhases";
import type { AppExample } from "@/lib/appExamples";
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
  onSelectApp: (app: AppExample) => void;
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
      lightRef.current.intensity = getLightIntensityAt(scrollProgress) * 0.05;
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

// The point light rides the light trail's head (see ValleyLightTrail) so the
// canyon walls catch a cold blue-white glow exactly where the ribbon of
// energy is passing -- the trail is the visible light source, this light is
// what lets it "illuminate the rock on its way through".
const TRAVEL_LIGHT_AHEAD = 26;
const TRAVEL_LIGHT_LIFT = 4;

const travelCamPos = new Vector3();
const travelLookAt = new Vector3();
const travelForward = new Vector3();
const travelTarget = new Vector3();

function TravelingLight({ scrollProgress, theme }: TravelingLightProps) {
  const lightRef = useRef<PointLight>(null);

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
    lightRef.current.intensity = (theme === "dark" ? 55 : 0) * flicker;
  });

  return <pointLight ref={lightRef} color="#9cc8ff" distance={80} decay={1.7} intensity={0} />;
}

export function Scene({ scrollProgress, reducedMotion, theme, onSelectApp }: SceneProps) {
  const performanceTier = useMemo(() => detectPerformanceTier(), []);
  const highQuality = performanceTier === "high";
  const segments = highQuality ? 120 : 70;
  const mouse = useMouseParallax(!reducedMotion);
  const palette = THEME_PALETTES[theme];

  // Camera and trail-head motion pause inside the services split window
  // while the raw scroll drives the branch animation (see scrollPhases.ts).
  const worldProgress = getWorldProgress(scrollProgress);
  const splitPhase = getSplitPhase(scrollProgress);

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
      <RimLight scrollProgress={worldProgress} theme={theme} />
      <TravelingLight scrollProgress={worldProgress} theme={theme} />
      <ValleyLightTrail scrollProgress={worldProgress} theme={theme} />
      <TrailSplit splitPhase={splitPhase} onSelectApp={onSelectApp} />
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
      <CameraRig scrollProgress={worldProgress} reducedMotion={reducedMotion} mouse={mouse} />
    </Canvas>
  );
}
