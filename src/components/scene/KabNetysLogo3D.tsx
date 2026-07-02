import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D, RoundedBox, Billboard, Float } from "@react-three/drei";
import { AdditiveBlending, CatmullRomCurve3, Group, TubeGeometry, Vector3 } from "three";
import { buildRadialGlowTexture } from "@/lib/glowTexture";

interface KabNetysLogo3DProps {
  float?: boolean;
}

const FONT_URL = "/fonts/helvetiker_bold.typeface.json";
const BADGE_COLOR = "#04122e";
const KAB_RGB = "57,200,255";
const NETYS_RGB = "225,255,255";

function buildCircuitGeometry(points: [number, number, number][]): TubeGeometry {
  const curve = new CatmullRomCurve3(points.map((p) => new Vector3(...p)), false, "catmullrom", 0.1);
  return new TubeGeometry(curve, Math.max(2, points.length * 4), 0.03, 6, false);
}

const CIRCUIT_PATHS: [number, number, number][][] = [
  [
    [1.55, 0.85, 0.05],
    [1.85, 0.85, 0.05],
    [2.1, 1.1, 0.05],
    [2.75, 1.1, 0.05],
  ],
  [
    [2.1, 1.1, 0.05],
    [2.1, 0.55, 0.05],
    [2.4, 0.3, 0.05],
  ],
  [
    [-1.9, -1.35, 0.05],
    [-1.9, -1.7, 0.05],
    [-1.55, -1.95, 0.05],
    [-1.1, -1.95, 0.05],
  ],
];

const CIRCUIT_NODES: [number, number, number][] = [
  [2.75, 1.1, 0.05],
  [2.4, 0.3, 0.05],
  [-1.1, -1.95, 0.05],
];

function LogoContent() {
  const glowRef = useRef<Group>(null);

  const kabGlow = useMemo(() => buildRadialGlowTexture(KAB_RGB), []);
  const netysGlow = useMemo(() => buildRadialGlowTexture(NETYS_RGB), []);
  const circuitGeometries = useMemo(() => CIRCUIT_PATHS.map(buildCircuitGeometry), []);

  useFrame(({ clock }) => {
    if (!glowRef.current) return;
    const pulse = 0.85 + Math.sin(clock.elapsedTime * 1.6) * 0.15;
    glowRef.current.scale.setScalar(pulse);
  });

  return (
    <group>
      <RoundedBox args={[4.2, 3.1, 0.35]} radius={0.28} smoothness={4} position={[-1.95, -0.1, -0.2]}>
        <meshStandardMaterial
          color={BADGE_COLOR}
          emissive="#082252"
          emissiveIntensity={0.5}
          metalness={0.5}
          roughness={0.4}
        />
      </RoundedBox>

      <group position={[-3.85, -1, 0.05]}>
        <Text3D
          font={FONT_URL}
          size={1.55}
          height={0.22}
          bevelEnabled
          bevelThickness={0.025}
          bevelSize={0.018}
          curveSegments={6}
        >
          KAB
          <meshStandardMaterial
            color={`rgb(${KAB_RGB})`}
            emissive={`rgb(${KAB_RGB})`}
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </Text3D>
      </group>

      <group position={[1.55, -0.5, 0.05]}>
        <Text3D
          font={FONT_URL}
          size={0.85}
          height={0.16}
          bevelEnabled
          bevelThickness={0.018}
          bevelSize={0.012}
          curveSegments={6}
        >
          netys
          <meshStandardMaterial
            color={`rgb(${NETYS_RGB})`}
            emissive={`rgb(${NETYS_RGB})`}
            emissiveIntensity={1.3}
            toneMapped={false}
          />
        </Text3D>
      </group>

      {circuitGeometries.map((geometry, i) => (
        <mesh key={`circuit-${i}`} geometry={geometry}>
          <meshBasicMaterial color={`rgb(${KAB_RGB})`} toneMapped={false} fog={false} />
        </mesh>
      ))}
      {CIRCUIT_NODES.map((pos, i) => (
        <mesh key={`node-${i}`} position={pos}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshBasicMaterial color={`rgb(${KAB_RGB})`} toneMapped={false} fog={false} />
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
        <Billboard position={[2, -0.15, 0.1]}>
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
