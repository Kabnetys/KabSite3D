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
import { ChapterTextModule3D } from "./ChapterTextModule3D";
import { CameraRig } from "./CameraRig";
import { Vector3 } from "three";
import { THEME_PALETTES, type SceneTheme } from "@/lib/theme";
import { computeChapterPanelTransform } from "@/lib/chapterPanels";

interface ChapterPanelConfig {
  chapterIndex: number;
  lines: string[];
  distance: number;
  lateral: number;
  vertical: number;
}

const CHAPTER_PANELS: ChapterPanelConfig[] = [
  {
    chapterIndex: 0,
    lines: [
      "Pour chaque artisan,",
      "un outil sur mesure.",
      "KabNetys imagine des",
      "solutions pensées",
      "pour votre métier.",
    ],
    distance: 10,
    lateral: -2,
    vertical: 1,
  },
  {
    chapterIndex: 1,
    lines: ["Excel en versions", "multiples,", "erreurs de saisie,", "temps perdu."],
    distance: 10,
    lateral: 2,
    vertical: 1,
  },
  {
    chapterIndex: 2,
    lines: ["Applications métier,", "sites internet,", "automatisation."],
    distance: 10,
    lateral: -2,
    vertical: 1,
  },
  {
    chapterIndex: 3,
    lines: ["L'IA propose,", "on dispose.", "Un copilote,", "jamais un pilote."],
    distance: 10,
    lateral: 2,
    vertical: 1,
  },
  {
    chapterIndex: 4,
    lines: ["Kyllian & Anthony.", "Deux devs,", "une exigence commune."],
    distance: 10,
    lateral: -2,
    vertical: 1,
  },
  {
    chapterIndex: 5,
    lines: ["Votre projet", "commence ici."],
    distance: 9,
    lateral: 3,
    vertical: 0.5,
  },
];

const CHAPTER_PANEL_TRANSFORMS = CHAPTER_PANELS.map((config) => ({
  config,
  transform: computeChapterPanelTransform(
    config.chapterIndex,
    config.distance,
    config.lateral,
    config.vertical
  ),
}));

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
        {CHAPTER_PANEL_TRANSFORMS.map(({ config, transform }) => (
          <group
            key={config.chapterIndex}
            position={transform.position}
            rotation={[0, transform.rotationY, 0]}
          >
            <ChapterTextModule3D
              chapterIndex={config.chapterIndex}
              lines={config.lines}
              scrollProgress={scrollProgress}
            />
          </group>
        ))}
      </Suspense>
      <CameraRig scrollProgress={scrollProgress} reducedMotion={reducedMotion} mouse={mouse} />
    </Canvas>
  );
}
