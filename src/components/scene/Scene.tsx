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
import { AppMockupModel } from "./AppMockupModel";
import { CameraRig } from "./CameraRig";
import { Vector3 } from "three";
import { THEME_PALETTES, type SceneTheme } from "@/lib/theme";
import { computePanelTransformAtProgress } from "@/lib/chapterPanels";
import { getLightColorAt, getLightIntensityAt } from "@/lib/chapterAppearance";

interface ChapterPanelConfig {
  id: string;
  heading?: string;
  lines: string[];
  /** Point along the continuous scroll (0..1) where this beat peaks. */
  peakProgress: number;
  /** Half-width of the smooth fade-in/fade-out window around peakProgress. */
  fadeHalfWidth: number;
  distance: number;
  lateral: number;
  vertical: number;
}

// A short cinematic scenario told across the valley's flight, broken into
// small narrative beats (rather than one dense panel per chapter). Several
// beats can share the same chapter and appear one after another as the
// camera continues past -- each one fades in, peaks, and fades back out on
// its own, continuously tied to scrollProgress.
const CHAPTER_PANELS: ChapterPanelConfig[] = [
  // -- L'Aube : l'idée qui manquait --
  {
    id: "aube-1",
    heading: "L'AUBE",
    lines: ["Chaque artisan mérite", "un outil à son image."],
    peakProgress: 0.02,
    fadeHalfWidth: 0.06,
    distance: 8,
    lateral: -1.6,
    vertical: 0.9,
  },
  // -- La Friction : le quotidien qui coince --
  {
    id: "friction-1",
    lines: ["Excel qui déborde.", "Des versions qui se contredisent."],
    peakProgress: 0.13,
    fadeHalfWidth: 0.05,
    distance: 8,
    lateral: 1.7,
    vertical: 1,
  },
  {
    id: "friction-2",
    lines: ["Le temps perdu,", "ça suffit."],
    peakProgress: 0.19,
    fadeHalfWidth: 0.05,
    distance: 7.5,
    lateral: -1.5,
    vertical: 0.7,
  },
  // -- La Percee : on construit la solution --
  {
    id: "percee-1",
    heading: "LA PERCÉE",
    lines: ["Alors on construit."],
    peakProgress: 0.32,
    fadeHalfWidth: 0.05,
    distance: 8,
    lateral: -1.8,
    vertical: 1,
  },
  {
    id: "percee-2",
    lines: ["Applications métier.", "Sites. Automatisation."],
    peakProgress: 0.4,
    fadeHalfWidth: 0.06,
    distance: 8,
    lateral: 1.6,
    vertical: 0.8,
  },
  // -- L'Intelligence : l'IA au service du geste --
  {
    id: "intelligence-1",
    heading: "L'INTELLIGENCE",
    lines: ["L'IA propose,", "on dispose."],
    peakProgress: 0.55,
    fadeHalfWidth: 0.07,
    distance: 8,
    lateral: 2.2,
    vertical: 1.1,
  },
  // -- L'Equipe : deux visages derriere le projet --
  {
    id: "equipe-1",
    heading: "L'ÉQUIPE",
    lines: ["Anthony & Kyllian."],
    peakProgress: 0.68,
    fadeHalfWidth: 0.05,
    distance: 8,
    lateral: -1.6,
    vertical: 1,
  },
  {
    id: "equipe-2",
    lines: ["Deux regards,", "un seul objectif : vous."],
    peakProgress: 0.74,
    fadeHalfWidth: 0.05,
    distance: 7.5,
    lateral: 1.6,
    vertical: 0.8,
  },
  // -- L'Horizon : le depart d'une nouvelle histoire --
  {
    id: "horizon-1",
    heading: "L'HORIZON",
    lines: ["Votre projet", "commence ici."],
    peakProgress: 0.85,
    fadeHalfWidth: 0.06,
    distance: 8,
    lateral: -1.8,
    vertical: 1,
  },
  {
    id: "horizon-2",
    lines: ["Parlons-en."],
    peakProgress: 0.93,
    fadeHalfWidth: 0.06,
    distance: 7,
    lateral: 1.5,
    vertical: 0.7,
  },
];

const CHAPTER_PANEL_TRANSFORMS = CHAPTER_PANELS.map((config) => ({
  config,
  transform: computePanelTransformAtProgress(
    config.peakProgress,
    config.distance,
    config.lateral,
    config.vertical
  ),
}));

const INTELLIGENCE_PEAK_PROGRESS = 0.55;
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

    // Dark mode carries the storyboard's per-chapter mood light (violet ->
    // red-orange -> cyan -> electric blue -> amber -> white, see
    // chapterAppearance.ts / CONCEPT.md). Light mode stays a fixed daylight
    // sun regardless of chapter.
    if (theme === "dark") {
      lightRef.current.color.copy(getLightColorAt(scrollProgress));
      lightRef.current.intensity = getLightIntensityAt(scrollProgress) * 0.18;
    } else {
      lightRef.current.color.set(palette.sunColor);
      lightRef.current.intensity = palette.sunIntensity;
    }
  });

  return <directionalLight ref={lightRef} castShadow={false} />;
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
            key={config.id}
            position={transform.position}
            rotation={[0, transform.rotationY, 0]}
          >
            <ChapterTextModule3D
              heading={config.heading}
              lines={config.lines}
              scrollProgress={scrollProgress}
              peakProgress={config.peakProgress}
              fadeHalfWidth={config.fadeHalfWidth}
            />
          </group>
        ))}
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
