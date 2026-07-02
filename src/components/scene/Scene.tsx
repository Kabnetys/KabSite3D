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
import { computeChapterPanelTransform } from "@/lib/chapterPanels";

interface ChapterPanelConfig {
  chapterIndex: number;
  heading?: string;
  lines: string[];
  distance: number;
  lateral: number;
  vertical: number;
}

// Real copy pulled from KabSit (the static marketing site)'s src/messages/fr.json,
// remapped onto the valley's six scroll-stops:
//   Aube -> hero, Friction -> method's first step (discovery), Percee -> services,
//   Intelligence -> the app-mockup section, Equipe -> team, Horizon -> contact.
const CHAPTER_PANELS: ChapterPanelConfig[] = [
  {
    chapterIndex: 0,
    heading: "L'AUBE",
    lines: [
      "Des outils métier,",
      "pas des bricolages.",
      "Développement sur mesure",
      "pour les TPE et PME qui",
      "veulent enfin des solutions",
      "qui leur ressemblent.",
    ],
    distance: 10,
    lateral: -2,
    vertical: 1,
  },
  {
    chapterIndex: 1,
    heading: "ÉCHANGE TERRAIN",
    lines: [
      "On pose les bonnes",
      "questions avant d'écrire",
      "la moindre ligne de code.",
      "On préfère commencer",
      "par une présence physique.",
    ],
    distance: 10,
    lateral: 2,
    vertical: 1,
  },
  {
    chapterIndex: 2,
    heading: "SERVICES",
    lines: [
      "Applications métier",
      "Sites internet",
      "Automatisation",
      "Sur mesure, sécurisé,",
      "zéro ressaisie.",
    ],
    distance: 10,
    lateral: -2,
    vertical: 1,
  },
  {
    chapterIndex: 3,
    heading: "APPLICATIONS",
    lines: [
      "Des interfaces qui",
      "travaillent pour vous.",
      "Multi-utilisateurs,",
      "sécurisée, évolutive,",
      "sur mesure.",
    ],
    distance: 10,
    lateral: 2.4,
    vertical: 1.2,
  },
  {
    chapterIndex: 4,
    heading: "L'ÉQUIPE",
    lines: [
      "Anthony Bonjour",
      "Directeur Général",
      "Kyllian Bletrix",
      "Président",
      "Deux profils,",
      "un spectre complet.",
    ],
    distance: 10,
    lateral: -2,
    vertical: 1,
  },
  {
    chapterIndex: 5,
    heading: "CONTACT",
    lines: ["Parlons de votre projet.", "On vous répond sous 24h."],
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

const INTELLIGENCE_CHAPTER_INDEX = 3;
const APP_MOCKUP_TRANSFORM = computeChapterPanelTransform(INTELLIGENCE_CHAPTER_INDEX, 10, -3, 0.5);

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
              heading={config.heading}
              lines={config.lines}
              scrollProgress={scrollProgress}
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
