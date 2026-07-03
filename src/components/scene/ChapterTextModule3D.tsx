import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D, Float } from "@react-three/drei";
import {
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "three";
import { getPanelVisibility } from "@/lib/chapters";
import type { SceneTheme } from "@/lib/theme";

interface ChapterTextModule3DProps {
  /** Small caps chapter label floating above the statement, e.g. "01 — LA FRICTION". */
  eyebrow?: string;
  heading?: string;
  lines: string[];
  scrollProgress: number;
  peakProgress: number;
  fadeHalfWidth?: number;
  textSize?: number;
  /** Multiplier applied to the heading relative to textSize -- bump this for
   * a big glowing stat callout (e.g. "26%") over a small label. */
  headingScale?: number;
  theme?: SceneTheme;
}

// Body copy needs accented French glyphs (é, è, ç, «, ») -- droid_sans has
// them, helvetiker does not (checked against the .typeface.json glyph
// tables). For the giant stat numerals (headingScale >= STAT_HEADING_SCALE)
// only digits/%/h are ever used, so the cleaner, more editorial helvetiker
// face is safe there.
const BODY_FONT_URL = "/fonts/droid_sans_regular.typeface.json";
const DISPLAY_FONT_URL = "/fonts/helvetiker_regular.typeface.json";
const STAT_HEADING_SCALE = 2;

const EYEBROW_RGB = "120,225,255";
const TEXT_RGB = "236,244,255";
const HEADING_RGB = "255,255,255";

const DEFAULT_TEXT_SIZE = 0.42;
const DEFAULT_FADE_HALF_WIDTH = 0.06;
const DEFAULT_HEADING_SCALE = 1.15;
const TEXT_DEPTH = 0.02;
const HEADING_DEPTH_SMALL = 0.025;
const HEADING_DEPTH_STAT = 0.05;
const EYEBROW_SIZE = 0.18;
const EYEBROW_LETTER_SPACING = 0.045;

// A soft radial glow used behind the giant stat numerals -- a small canvas
// texture with additive blending reads as luminous fog rather than a flat
// emissive plate.
let glowTexture: CanvasTexture | null = null;
function getGlowTexture(): CanvasTexture {
  if (glowTexture) return glowTexture;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, "rgba(180,230,255,0.9)");
    gradient.addColorStop(0.4, "rgba(120,200,255,0.35)");
    gradient.addColorStop(1, "rgba(120,200,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  glowTexture = new CanvasTexture(canvas);
  return glowTexture;
}

export function ChapterTextModule3D({
  eyebrow,
  heading,
  lines,
  scrollProgress,
  peakProgress,
  fadeHalfWidth = DEFAULT_FADE_HALF_WIDTH,
  textSize = DEFAULT_TEXT_SIZE,
  headingScale = DEFAULT_HEADING_SCALE,
  theme = "dark",
}: ChapterTextModule3DProps) {
  const groupRef = useRef<Group>(null);
  const driftRef = useRef<Group>(null);
  const eyebrowMaterialRef = useRef<MeshStandardMaterial | null>(null);
  const hairlineMaterialRef = useRef<MeshStandardMaterial | null>(null);
  const headingMaterialRef = useRef<MeshStandardMaterial | null>(null);
  const glowMaterialRef = useRef<MeshBasicMaterial | null>(null);
  const glowMeshRef = useRef<Mesh>(null);
  const textMaterialRefs = useRef<MeshStandardMaterial[]>([]);

  const isStat = headingScale >= STAT_HEADING_SCALE;
  const headingSize = textSize * headingScale;
  const lineHeight = textSize * 1.55;
  const headingGap = heading ? headingSize * (isStat ? 1.15 : 1.5) : 0;
  const eyebrowGap = eyebrow ? EYEBROW_SIZE * 2.4 : 0;

  // Legible white for dark skies; a deep ink for the light-mode daylight
  // valley where near-white text loses all contrast against pale fog.
  const bodyColor = theme === "light" ? "#12212f" : `rgb(${TEXT_RGB})`;
  const headingColor = theme === "light" ? "#0a1622" : `rgb(${HEADING_RGB})`;
  const eyebrowColor = theme === "light" ? "#0f5f7a" : `rgb(${EYEBROW_RGB})`;
  const bodyEmissiveIntensity = theme === "light" ? 0.05 : 0.55;
  const headingEmissiveIntensity = theme === "light" ? 0.08 : isStat ? 1.4 : 0.7;
  const eyebrowEmissiveIntensity = theme === "light" ? 0.1 : 1.1;

  const glowTex = useMemo(() => (isStat ? getGlowTexture() : null), [isStat]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const visibility = getPanelVisibility(scrollProgress, peakProgress, fadeHalfWidth);
    const eased = visibility * visibility * (3 - 2 * visibility);

    groupRef.current.visible = visibility > 0.01;

    // Gentle rise on fade-in and continued upward drift on fade-out --
    // driven purely by the same continuous visibility curve, never stepped.
    if (driftRef.current) {
      driftRef.current.position.y = (1 - eased) * 0.45;
    }

    if (eyebrowMaterialRef.current) eyebrowMaterialRef.current.opacity = eased;
    if (hairlineMaterialRef.current) hairlineMaterialRef.current.opacity = eased * 0.9;
    if (headingMaterialRef.current) headingMaterialRef.current.opacity = eased;
    textMaterialRefs.current.forEach((material) => {
      if (material) material.opacity = eased;
    });
    if (glowMaterialRef.current) {
      const pulse = 0.85 + Math.sin(clock.elapsedTime * 1.1) * 0.15;
      glowMaterialRef.current.opacity = eased * 0.55 * pulse;
    }
  });

  // Simple top-down stack: eyebrow (if any), then heading (if any), then
  // body lines -- each offset purely by the size of what came before it.
  const eyebrowY = 0;
  const headingY = eyebrow ? eyebrowY - eyebrowGap : 0;
  const linesTopY = headingY - headingGap;

  return (
    <group ref={groupRef}>
      <group ref={driftRef}>
        <Float speed={1} rotationIntensity={0.06} floatIntensity={0.3}>
          <group>
            {eyebrow ? (
              <group position={[0, eyebrowY, 0]}>
                {/* Small tick mark to the left of the eyebrow label -- a
                    single geometric accent instead of a boxed heading. */}
                <mesh position={[-0.32, 0.075, 0]}>
                  <boxGeometry args={[0.22, 0.014, 0.01]} />
                  <meshStandardMaterial
                    ref={(material) => {
                      hairlineMaterialRef.current = material;
                    }}
                    color={eyebrowColor}
                    emissive={eyebrowColor}
                    emissiveIntensity={eyebrowEmissiveIntensity}
                    toneMapped={false}
                    transparent
                    opacity={0}
                  />
                </mesh>
                <Text3D
                  font={BODY_FONT_URL}
                  size={EYEBROW_SIZE}
                  height={0.008}
                  letterSpacing={EYEBROW_LETTER_SPACING}
                  curveSegments={4}
                >
                  {eyebrow}
                  <meshStandardMaterial
                    ref={(material) => {
                      eyebrowMaterialRef.current = material;
                    }}
                    color={eyebrowColor}
                    emissive={eyebrowColor}
                    emissiveIntensity={eyebrowEmissiveIntensity}
                    toneMapped={false}
                    transparent
                    opacity={0}
                  />
                </Text3D>
              </group>
            ) : null}

            {heading ? (
              <group position={[isStat ? -headingSize * 0.06 : 0, headingY, 0]}>
                {isStat && glowTex ? (
                  <mesh ref={glowMeshRef} position={[headingSize * 0.9, headingSize * 0.15, -0.06]}>
                    <planeGeometry args={[headingSize * 3.2, headingSize * 3.2]} />
                    <meshBasicMaterial
                      ref={(material) => {
                        glowMaterialRef.current = material;
                      }}
                      map={glowTex}
                      transparent
                      opacity={0}
                      depthWrite={false}
                      toneMapped={false}
                    />
                  </mesh>
                ) : null}
                <Text3D
                  font={isStat ? DISPLAY_FONT_URL : BODY_FONT_URL}
                  size={headingSize}
                  height={isStat ? HEADING_DEPTH_STAT : HEADING_DEPTH_SMALL}
                  curveSegments={isStat ? 8 : 6}
                  bevelEnabled={isStat}
                  bevelThickness={0.012}
                  bevelSize={0.008}
                  bevelSegments={2}
                  letterSpacing={isStat ? 0 : 0.01}
                >
                  {heading}
                  <meshStandardMaterial
                    ref={(material) => {
                      headingMaterialRef.current = material;
                    }}
                    color={headingColor}
                    emissive={headingColor}
                    emissiveIntensity={headingEmissiveIntensity}
                    roughness={0.35}
                    metalness={0.05}
                    toneMapped={false}
                    transparent
                    opacity={0}
                  />
                </Text3D>
              </group>
            ) : null}

            {lines.map((line, i) => {
              const y = linesTopY - i * lineHeight - textSize * 0.4;
              return (
                <group key={line} position={[0, y, 0]}>
                  <Text3D
                    font={BODY_FONT_URL}
                    size={textSize}
                    height={TEXT_DEPTH}
                    curveSegments={5}
                    letterSpacing={0.006}
                  >
                    {line}
                    <meshStandardMaterial
                      ref={(material) => {
                        if (material) textMaterialRefs.current[i] = material;
                      }}
                      color={bodyColor}
                      emissive={bodyColor}
                      emissiveIntensity={bodyEmissiveIntensity}
                      roughness={0.5}
                      toneMapped={false}
                      transparent
                      opacity={0}
                    />
                  </Text3D>
                </group>
              );
            })}
          </group>
        </Float>
      </group>
    </group>
  );
}
