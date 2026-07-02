import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import { DirectionalLight } from "three";
import { detectPerformanceTier } from "@/lib/devicePerformance";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { getCameraPositionAt } from "@/lib/cameraPath";
import { ValleyTerrain } from "./ValleyTerrain";
import { ValleyAtmosphere } from "./ValleyAtmosphere";
import { ValleyWater } from "./ValleyWater";
import { Moon } from "./Moon";
import { KabNetysLogo3D } from "./KabNetysLogo3D";
import { ChapterTextModule3D } from "./ChapterTextModule3D";
import { CameraRig } from "./CameraRig";
import { Vector3 } from "three";
import { THEME_PALETTES, type SceneTheme } from "@/lib/theme";
import { CHAPTERS } from "@/lib/chapters";
import { valleyHeightAt, DEFAULT_VALLEY_CONFIG } from "@/lib/valleyTerrain";

const PERCEE_CHAPTER_INDEX = 2;
const LOGO_X_OFFSET = 20;
const LOGO_Z_OFFSET = 6;
const LOGO_HOVER = 11;
const logoChapter = CHAPTERS[PERCEE_CHAPTER_INDEX];
const LOGO_X = logoChapter.position[0] + LOGO_X_OFFSET;
const LOGO_Z = logoChapter.position[2] + LOGO_Z_OFFSET;
const LOGO_Y = valleyHeightAt(LOGO_X, LOGO_Z, DEFAULT_VALLEY_CONFIG) + LOGO_HOVER;

const AUBE_CHAPTER_INDEX = 0;
const AUBE_TEXT_LINES = ["Pour chaque artisan,", "un outil sur mesure."];
const aubeChapter = CHAPTERS[AUBE_CHAPTER_INDEX];
const AUBE_TEXT_X = aubeChapter.position[0] + 9;
const AUBE_TEXT_Z = aubeChapter.position[2] - 8;
const AUBE_TEXT_Y = valleyHeightAt(AUBE_TEXT_X, AUBE_TEXT_Z, DEFAULT_VALLEY_CONFIG) + 7;

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
  });

  return (
    <directionalLight
      ref={lightRef}
      color={palette.sunColor}
      intensity={palette.sunIntensity}
      castShadow={false}
    />
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
      <ValleyAtmosphere scrollProgress={scrollProgress} theme={theme} />
      <Moon theme={theme} />
      <Suspense fallback={null}>
        <ValleyTerrain segments={segments} scrollProgress={scrollProgress} theme={theme} />
      </Suspense>
      <Suspense fallback={null}>
        <ValleyWater scrollProgress={scrollProgress} theme={theme} />
      </Suspense>
      <Suspense fallback={null}>
        <group position={[LOGO_X, LOGO_Y, LOGO_Z]} rotation={[0, Math.PI * 0.15, 0]} scale={0.9}>
          <KabNetysLogo3D />
        </group>
      </Suspense>
      <Suspense fallback={null}>
        <group position={[AUBE_TEXT_X, AUBE_TEXT_Y, AUBE_TEXT_Z]} rotation={[0, -Math.PI * 0.12, 0]}>
          <ChapterTextModule3D
            chapterIndex={AUBE_CHAPTER_INDEX}
            lines={AUBE_TEXT_LINES}
            scrollProgress={scrollProgress}
          />
        </group>
      </Suspense>
      <CameraRig scrollProgress={scrollProgress} reducedMotion={reducedMotion} mouse={mouse} />
    </Canvas>
  );
}
