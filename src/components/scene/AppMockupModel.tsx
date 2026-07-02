import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { BoxGeometry, EdgesGeometry, Group } from "three";

// Ported from KabSit (the static marketing site)'s AppMockupScene.ts: a
// simple "browser window" made of boxes -- frame, screen, top bar with
// traffic-light dots, a handful of content rows with badges, and a
// wireframe outline -- used here as the 3D "app example" visual for the
// Intelligence/Mockup chapter.

const DOT_COLORS = ["#ff5f57", "#ffbd2e", "#28c941"];
const BADGE_COLORS = ["#00cc55", "#ffaa00", "#0066ff"];

interface ContentRow {
  width: number;
  y: number;
  hasBadge: boolean;
  badgeColor: string;
}

function buildRows(): ContentRow[] {
  const rows: ContentRow[] = [];
  for (let r = 0; r < 6; r += 1) {
    rows.push({
      width: 2.2 + ((r * 37) % 10) / 10,
      y: 0.85 - r * 0.32,
      hasBadge: r < 3,
      badgeColor: BADGE_COLORS[r % BADGE_COLORS.length],
    });
  }
  return rows;
}

export function AppMockupModel() {
  const groupRef = useRef<Group>(null);
  const rows = useMemo(() => buildRows(), []);
  const edges = useMemo(() => new EdgesGeometry(new BoxGeometry(4.05, 2.85, 0.08)), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.6) * 0.07;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        <mesh>
          <boxGeometry args={[4, 2.8, 0.05]} />
          <meshStandardMaterial
            color="#0a1245"
            emissive="#0066ff"
            emissiveIntensity={0.08}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        <mesh position={[0, -0.05, 0.04]}>
          <boxGeometry args={[3.8, 2.5, 0.02]} />
          <meshStandardMaterial color="#050b2e" roughness={0.9} />
        </mesh>

        <mesh position={[0, 1.15, 0.05]}>
          <boxGeometry args={[3.8, 0.2, 0.02]} />
          <meshStandardMaterial color="#0a1a5e" />
        </mesh>

        {DOT_COLORS.map((color, i) => (
          <mesh key={color} position={[-1.7 + i * 0.14, 1.15, 0.07]}>
            <circleGeometry args={[0.04, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
          </mesh>
        ))}

        {rows.map((row, i) => (
          <group key={i}>
            <mesh position={[-0.1 - (3 - row.width) / 2, row.y, 0.07]}>
              <boxGeometry args={[row.width, 0.06, 0.01]} />
              <meshStandardMaterial color="#0066ff" transparent opacity={0.18} />
            </mesh>
            {row.hasBadge ? (
              <mesh position={[1.6, row.y, 0.07]}>
                <boxGeometry args={[0.35, 0.14, 0.01]} />
                <meshStandardMaterial color={row.badgeColor} transparent opacity={0.7} />
              </mesh>
            ) : null}
          </group>
        ))}

        <lineSegments geometry={edges}>
          <lineBasicMaterial color="#00ccff" transparent opacity={0.35} />
        </lineSegments>

        <pointLight color="#00ccff" intensity={2} distance={12} position={[3, 3, 3]} />
      </group>
    </Float>
  );
}
