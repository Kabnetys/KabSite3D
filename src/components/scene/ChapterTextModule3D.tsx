import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D, Float } from "@react-three/drei";
import {
  EdgesGeometry,
  ExtrudeGeometry,
  Group,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
  Shape,
} from "three";
import { getChapterBlend } from "@/lib/chapters";

interface ChapterTextModule3DProps {
  chapterIndex: number;
  lines: string[];
  scrollProgress: number;
}

const FONT_URL = "/fonts/droid_sans_regular.typeface.json";
const PANEL_COLOR = "#04122e";
const EDGE_RGB = "80,220,255";
const TEXT_RGB = "225,255,255";
const LINE_HEIGHT = 0.42;
const TEXT_SIZE = 0.3;
const TEXT_DEPTH = 0.05;
const PANEL_DEPTH = 0.12;
const FADE_WIDTH = 0.05;

function buildChamferedRectShape(width: number, height: number, chamfer: number): Shape {
  const w = width / 2;
  const h = height / 2;
  const shape = new Shape();
  shape.moveTo(-w + chamfer, -h);
  shape.lineTo(w - chamfer, -h);
  shape.lineTo(w, -h + chamfer);
  shape.lineTo(w, h - chamfer);
  shape.lineTo(w - chamfer, h);
  shape.lineTo(-w + chamfer, h);
  shape.lineTo(-w, h - chamfer);
  shape.lineTo(-w, -h + chamfer);
  shape.closePath();
  return shape;
}

export function ChapterTextModule3D({ chapterIndex, lines, scrollProgress }: ChapterTextModule3DProps) {
  const groupRef = useRef<Group>(null);
  const panelRef = useRef<Mesh>(null);
  const edgesMaterialRef = useRef<LineBasicMaterial>(null);
  const textMaterialRefs = useRef<MeshStandardMaterial[]>([]);

  const panelWidth = 4.6;
  const panelHeight = LINE_HEIGHT * lines.length + 0.7;

  const panelGeometry = useMemo(() => {
    const shape = buildChamferedRectShape(panelWidth, panelHeight, 0.3);
    return new ExtrudeGeometry(shape, {
      depth: PANEL_DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.018,
      bevelSegments: 3,
      curveSegments: 4,
    });
  }, [panelWidth, panelHeight]);

  const panelEdges = useMemo(() => new EdgesGeometry(panelGeometry, 20), [panelGeometry]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const { index, t } = getChapterBlend(scrollProgress);
    let visibility = 0;
    if (index === chapterIndex) {
      visibility = t > 1 - FADE_WIDTH ? Math.max(0, (1 - t) / FADE_WIDTH) : 1;
    } else if (index === chapterIndex - 1) {
      visibility = Math.min(1, t / FADE_WIDTH);
    }

    groupRef.current.visible = visibility > 0.01;

    if (panelRef.current) {
      const material = panelRef.current.material as MeshStandardMaterial;
      material.opacity = visibility;
    }
    if (edgesMaterialRef.current) {
      edgesMaterialRef.current.opacity = visibility;
    }
    textMaterialRefs.current.forEach((material) => {
      if (material) material.opacity = visibility;
    });

    if (edgesMaterialRef.current) {
      const pulse = 0.8 + Math.sin(clock.elapsedTime * 1.4) * 0.2;
      edgesMaterialRef.current.color.setRGB(0.31 * pulse, 0.86 * pulse, 1);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.4}>
        <group>
          <mesh ref={panelRef} geometry={panelGeometry} position={[0, 0, -PANEL_DEPTH / 2]}>
            <meshStandardMaterial
              color={PANEL_COLOR}
              emissive="#0a2a5e"
              emissiveIntensity={0.5}
              metalness={0.5}
              roughness={0.4}
              transparent
              opacity={0}
            />
          </mesh>
          <lineSegments geometry={panelEdges} position={[0, 0, -PANEL_DEPTH / 2]}>
            <lineBasicMaterial
              ref={edgesMaterialRef}
              color={`rgb(${EDGE_RGB})`}
              toneMapped={false}
              transparent
              opacity={0}
            />
          </lineSegments>

          {lines.map((line, i) => {
            const y = (lines.length - 1) * 0.5 * LINE_HEIGHT - i * LINE_HEIGHT - TEXT_SIZE * 0.35;
            return (
              <group key={line} position={[-panelWidth / 2 + 0.35, y, PANEL_DEPTH / 2 + 0.04]}>
                <Text3D
                  font={FONT_URL}
                  size={TEXT_SIZE}
                  height={TEXT_DEPTH}
                  bevelEnabled
                  bevelThickness={0.008}
                  bevelSize={0.006}
                  bevelSegments={3}
                  curveSegments={6}
                >
                  {line}
                  <meshStandardMaterial
                    ref={(material) => {
                      if (material) textMaterialRefs.current[i] = material;
                    }}
                    color={`rgb(${TEXT_RGB})`}
                    emissive={`rgb(${TEXT_RGB})`}
                    emissiveIntensity={1.2}
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
  );
}
