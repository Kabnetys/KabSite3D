import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D, RoundedBox, Billboard, Float } from "@react-three/drei";
import {
  AdditiveBlending,
  CatmullRomCurve3,
  EdgesGeometry,
  ExtrudeGeometry,
  Group,
  Shape,
  TubeGeometry,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { buildRadialGlowTexture } from "@/lib/glowTexture";

interface KabNetysLogo3DProps {
  float?: boolean;
}

const KAB_FONT_URL = "/fonts/droid_sans_bold.typeface.json";
const NETYS_FONT_URL = "/fonts/droid_sans_mono_regular.typeface.json";
const BADGE_COLOR = "#051633";
const KAB_RGB = "57,200,255";
const NETYS_RGB = "225,255,255";
const EDGE_RGB = "80,220,255";

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

function buildChamferedPanelGeometry(width: number, height: number, chamfer: number): ExtrudeGeometry {
  const shape = buildChamferedRectShape(width, height, chamfer);
  return new ExtrudeGeometry(shape, {
    depth: 0.32,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 4,
  });
}

function buildCircuitGeometry(points: [number, number, number][]): TubeGeometry {
  const curve = new CatmullRomCurve3(points.map((p) => new Vector3(...p)), false, "catmullrom", 0.1);
  return new TubeGeometry(curve, Math.max(2, points.length * 4), 0.03, 6, false);
}

const CIRCUIT_PATHS: [number, number, number][][] = [
  [
    [0.25, 1.35, 0.05],
    [0.75, 1.35, 0.05],
    [1.05, 1.05, 0.05],
    [1.7, 1.05, 0.05],
  ],
  [
    [1.05, 1.05, 0.05],
    [1.05, 0.45, 0.05],
    [1.35, 0.15, 0.05],
  ],
  [
    [-4.05, -1.15, 0.05],
    [-4.4, -1.5, 0.05],
    [-4.4, -1.9, 0.05],
    [-4.05, -2.2, 0.05],
    [-3.55, -2.2, 0.05],
  ],
];

const CIRCUIT_NODES: [number, number, number][] = [
  [1.7, 1.05, 0.05],
  [1.35, 0.15, 0.05],
  [-4.4, -1.9, 0.05],
  [-3.55, -2.2, 0.05],
];

const BADGE_WIDTH = 4.2;
const BADGE_HEIGHT = 3.1;
const BADGE_POSITION: [number, number, number] = [-1.95, -0.1, -0.2];
const NETYS_PANEL_WIDTH = 3.1;
const NETYS_PANEL_HEIGHT = 1.55;
const NETYS_PANEL_POSITION: [number, number, number] = [1.55, -0.45, -0.2];

function LogoContent() {
  const glowRef = useRef<Group>(null);

  const kabGlow = useMemo(() => buildRadialGlowTexture(KAB_RGB), []);
  const netysGlow = useMemo(() => buildRadialGlowTexture(NETYS_RGB), []);
  const circuitGeometries = useMemo(() => CIRCUIT_PATHS.map(buildCircuitGeometry), []);
  const netysPanelGeometry = useMemo(
    () => buildChamferedPanelGeometry(NETYS_PANEL_WIDTH, NETYS_PANEL_HEIGHT, 0.35),
    []
  );
  const netysPanelEdges = useMemo(() => new EdgesGeometry(netysPanelGeometry, 20), [netysPanelGeometry]);
  const badgeEdges = useMemo(() => {
    const geometry = new RoundedBoxGeometry(BADGE_WIDTH, BADGE_HEIGHT, 0.35, 5, 0.32);
    return new EdgesGeometry(geometry, 20);
  }, []);

  useFrame(({ clock }) => {
    if (!glowRef.current) return;
    const pulse = 0.85 + Math.sin(clock.elapsedTime * 1.6) * 0.15;
    glowRef.current.scale.setScalar(pulse);
  });

  return (
    <group>
      <RoundedBox args={[BADGE_WIDTH, BADGE_HEIGHT, 0.35]} radius={0.32} smoothness={5} position={BADGE_POSITION}>
        <meshStandardMaterial
          color={BADGE_COLOR}
          emissive="#0a2a5e"
          emissiveIntensity={0.5}
          metalness={0.55}
          roughness={0.35}
        />
      </RoundedBox>
      <lineSegments geometry={badgeEdges} position={BADGE_POSITION}>
        <lineBasicMaterial color={`rgb(${EDGE_RGB})`} toneMapped={false} />
      </lineSegments>

      <mesh geometry={netysPanelGeometry} position={NETYS_PANEL_POSITION}>
        <meshStandardMaterial
          color={BADGE_COLOR}
          emissive="#0a2a5e"
          emissiveIntensity={0.5}
          metalness={0.55}
          roughness={0.35}
        />
      </mesh>
      <lineSegments geometry={netysPanelEdges} position={NETYS_PANEL_POSITION}>
        <lineBasicMaterial color={`rgb(${EDGE_RGB})`} toneMapped={false} />
      </lineSegments>

      <group position={[-3.85, -1, 0.05]} rotation={[0, 0, -0.035]}>
        <Text3D
          font={KAB_FONT_URL}
          size={1.55}
          height={0.24}
          bevelEnabled
          bevelThickness={0.03}
          bevelSize={0.02}
          bevelSegments={3}
          curveSegments={10}
        >
          KAB
          <meshStandardMaterial
            color={`rgb(${KAB_RGB})`}
            emissive={`rgb(${KAB_RGB})`}
            emissiveIntensity={1.7}
            toneMapped={false}
          />
        </Text3D>
      </group>

      <group position={[0.15, -0.85, 0.05]} rotation={[0, 0, -0.02]}>
        <Text3D
          font={NETYS_FONT_URL}
          size={0.72}
          height={0.16}
          bevelEnabled
          bevelThickness={0.016}
          bevelSize={0.01}
          bevelSegments={3}
          curveSegments={8}
        >
          netys
          <meshStandardMaterial
            color={`rgb(${NETYS_RGB})`}
            emissive={`rgb(${NETYS_RGB})`}
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </Text3D>
      </group>

      {circuitGeometries.map((geometry, i) => (
        <mesh key={`circuit-${i}`} geometry={geometry}>
          <meshBasicMaterial color={`rgb(${EDGE_RGB})`} toneMapped={false} fog={false} />
        </mesh>
      ))}
      {CIRCUIT_NODES.map((pos, i) => (
        <mesh key={`node-${i}`} position={pos}>
          <sphereGeometry args={[0.075, 10, 10]} />
          <meshBasicMaterial color={`rgb(${EDGE_RGB})`} toneMapped={false} fog={false} />
        </mesh>
      ))}

      <group ref={glowRef}>
        <Billboard position={[-2.9, -0.3, 0.1]}>
          <mesh>
            <planeGeometry args={[6, 4]} />
            <meshBasicMaterial
              map={kabGlow}
              transparent
              depthWrite={false}
              blending={AdditiveBlending}
              toneMapped={false}
              fog={false}
              opacity={0.55}
            />
          </mesh>
        </Billboard>
        <Billboard position={[1.7, -0.4, 0.1]}>
          <mesh>
            <planeGeometry args={[3.6, 2.2]} />
            <meshBasicMaterial
              map={netysGlow}
              transparent
              depthWrite={false}
              blending={AdditiveBlending}
              toneMapped={false}
              fog={false}
              opacity={0.45}
            />
          </mesh>
        </Billboard>
      </group>
    </group>
  );
}

export function KabNetysLogo3D({ float = true }: KabNetysLogo3DProps) {
  if (!float) return <LogoContent />;
  return (
    <Float speed={1.3} rotationIntensity={0.22} floatIntensity={0.55}>
      <LogoContent />
    </Float>
  );
}
