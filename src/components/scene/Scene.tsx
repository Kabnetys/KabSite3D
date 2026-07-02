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
  headingScale?: number;
  lines: string[];
  /** Point along the continuous scroll (0..1) where this beat peaks. */
  peakProgress: number;
  /** Half-width of the smooth fade-in/fade-out window around peakProgress. */
  fadeHalfWidth: number;
  distance: number;
  lateral: number;
  vertical: number;
}

// The confirmed storyboard from CONCEPT.md, section 4 ("Les 6 chapitres"),
// told across the valley's flight as short factual beats -- a business
// presentation, not marketing poetry. Several beats can share the same
// chapter and appear one after another as the camera continues past, each
// fading in, peaking, and fading back out continuously with scrollProgress.
const CHAPTER_PANELS: ChapterPanelConfig[] = [
  // -- L'Aube : l'accroche du dossier entreprise --
  {
    id: "aube-1",
    lines: ["Pour chaque artisan,", "un outil sur mesure."],
    peakProgress: 0.04,
    fadeHalfWidth: 0.06,
    distance: 8,
    lateral: -1.6,
    vertical: 0.9,
  },
  // -- La Friction : les points de douleur du dossier entreprise, un a la fois --
  {
    id: "friction-1",
    lines: ["Excel en versions", "multiples."],
    peakProgress: 0.18,
    fadeHalfWidth: 0.035,
    distance: 8,
    lateral: 1.7,
    vertical: 1,
  },
  {
    id: "friction-2",
    lines: ["Erreurs de saisie."],
    peakProgress: 0.23,
    fadeHalfWidth: 0.035,
    distance: 7.5,
    lateral: -1.5,
    vertical: 0.7,
  },
  {
    id: "friction-3",
    lines: ["Temps perdu", "à recopier."],
    peakProgress: 0.28,
    fadeHalfWidth: 0.035,
    distance: 8,
    lateral: 1.8,
    vertical: 1,
  },
  {
    id: "friction-4",
    lines: ["Des outils", "inadaptés."],
    peakProgress: 0.33,
    fadeHalfWidth: 0.035,
    distance: 7.5,
    lateral: -1.6,
    vertical: 0.8,
  },
  // -- La Percee : une carte par service (dossier entreprise + fr.json) --
  {
    id: "percee-1",
    heading: "APPLICATIONS MÉTIER",
    lines: ["Multi-utilisateurs,", "sécurisée, évolutive."],
    peakProgress: 0.4,
    fadeHalfWidth: 0.04,
    distance: 8.5,
    lateral: -1.8,
    vertical: 1,
  },
  {
    id: "percee-2",
    heading: "SITES INTERNET",
    lines: ["Vitrine, portail client,", "espace admin."],
    peakProgress: 0.46,
    fadeHalfWidth: 0.04,
    distance: 8.5,
    lateral: 1.8,
    vertical: 1,
  },
  {
    id: "percee-3",
    heading: "AUTOMATISATION",
    lines: ["Excel, Outlook connectés,", "zéro ressaisie."],
    peakProgress: 0.52,
    fadeHalfWidth: 0.04,
    distance: 8.5,
    lateral: -1.8,
    vertical: 1,
  },
  // -- L'Intelligence : la position du dossier entreprise + chiffres sourcés --
  {
    id: "intelligence-1",
    lines: ["L'IA propose,", "on dispose."],
    peakProgress: 0.58,
    fadeHalfWidth: 0.035,
    distance: 8,
    lateral: 2.2,
    vertical: 1.1,
  },
  {
    id: "intelligence-stat-1",
    heading: "26%",
    headingScale: 2.4,
    lines: ["de productivité en plus", "par développeur (McKinsey, 2024)"],
    peakProgress: 0.63,
    fadeHalfWidth: 0.035,
    distance: 8.5,
    lateral: -2.2,
    vertical: 1.1,
  },
  {
    id: "intelligence-stat-2",
    heading: "6h",
    headingScale: 2.4,
    lines: ["gagnées par équipe", "chaque semaine (McKinsey, 2024)"],
    peakProgress: 0.68,
    fadeHalfWidth: 0.035,
    distance: 8.5,
    lateral: 2.2,
    vertical: 1.1,
  },
  {
    id: "intelligence-stat-3",
    heading: "55%",
    headingScale: 2.4,
    lines: ["de code écrit plus vite", "avec l'IA (GitHub, 2024)"],
    peakProgress: 0.73,
    fadeHalfWidth: 0.035,
    distance: 8.5,
    lateral: -2.2,
    vertical: 1.1,
  },
  // -- L'Equipe : portraits + vraies citations (fr.json) --
  {
    id: "equipe-1",
    heading: "ANTHONY BONJOUR",
    lines: ["Directeur Général", "« Réseau, infrastructure,", "cybersécurité — j'interviens", "là où la technique", "fait la différence. »"],
    peakProgress: 0.78,
    fadeHalfWidth: 0.04,
    distance: 8.5,
    lateral: -1.8,
    vertical: 1,
  },
  {
    id: "equipe-2",
    heading: "KYLLIAN BLETRIX",
    lines: ["Président", "« Coder, transmettre,", "entreprendre — c'est ce qui", "me fait me lever chaque matin. »"],
    peakProgress: 0.83,
    fadeHalfWidth: 0.04,
    distance: 8.5,
    lateral: 1.8,
    vertical: 1,
  },
  // -- L'Horizon : la conclusion du dossier entreprise --
  {
    id: "horizon-1",
    lines: ["Votre projet", "commence ici."],
    peakProgress: 0.9,
    fadeHalfWidth: 0.05,
    distance: 8,
    lateral: -1.8,
    vertical: 1,
  },
  {
    id: "horizon-2",
    lines: ["Parlons-en."],
    peakProgress: 0.97,
    fadeHalfWidth: 0.05,
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
              headingScale={config.headingScale}
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
