import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { AdditiveBlending, Group, Mesh, MeshBasicMaterial, Vector3 } from "three";
import { getTrailCurve } from "./ValleyLightTrail";
import { APP_EXAMPLES, type AppExample } from "@/lib/appExamples";
import { buildRadialGlowTexture } from "@/lib/glowTexture";
import type { SceneTheme } from "@/lib/theme";

interface TrailNodesProps {
  scrollProgress: number;
  theme: SceneTheme;
  onSelectApp: (app: AppExample) => void;
}

// The three glowing stops on the light ribbon (services chapter). Each one
// pulses while the camera is nearby and opens an example application on
// click -- the trail literally "stops" at what KabNetys builds.
const NODE_VISIBILITY_RANGE = 0.16;
const LOGO_BLUE = "#39c8ff";

function setCursor(pointer: boolean) {
  if (typeof document !== "undefined") {
    document.body.style.cursor = pointer ? "pointer" : "";
  }
}

interface NodeProps {
  app: AppExample;
  scrollProgress: number;
  visible: boolean;
  onSelectApp: (app: AppExample) => void;
}

function TrailNode({ app, scrollProgress, visible, onSelectApp }: NodeProps) {
  const groupRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  const glowMaterialRef = useRef<MeshBasicMaterial>(null);

  const position = useMemo(() => {
    const point = new Vector3();
    getTrailCurve().getPoint(app.trailProgress, point);
    point.y += 1.1;
    return point;
  }, [app.trailProgress]);

  const glowTexture = useMemo(() => buildRadialGlowTexture("57,200,255"), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const proximity =
      1 - Math.min(1, Math.abs(scrollProgress - app.trailProgress) / NODE_VISIBILITY_RANGE);
    const eased = proximity * proximity * (3 - 2 * proximity);
    groupRef.current.visible = visible && eased > 0.02;
    if (!groupRef.current.visible) return;

    const time = clock.elapsedTime;
    const pulse = 1 + Math.sin(time * 2.4 + app.trailProgress * 40) * 0.14;
    groupRef.current.scale.setScalar(eased * pulse);

    if (ringRef.current) {
      const ringPulse = 1.15 + ((time * 0.55 + app.trailProgress * 3) % 1) * 1.3;
      ringRef.current.scale.setScalar(ringPulse);
      const material = ringRef.current.material as MeshBasicMaterial;
      material.opacity = Math.max(0, 0.55 * (1 - ((time * 0.55 + app.trailProgress * 3) % 1))) * eased;
    }
    if (glowMaterialRef.current) {
      glowMaterialRef.current.opacity = 0.7 * eased;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          onSelectApp(app);
          setCursor(false);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setCursor(true);
        }}
        onPointerOut={() => setCursor(false)}
      >
        <sphereGeometry args={[0.55, 20, 20]} />
        <meshBasicMaterial color={LOGO_BLUE} toneMapped={false} fog={false} />
      </mesh>

      <Billboard>
        <mesh ref={ringRef}>
          <ringGeometry args={[0.72, 0.8, 40]} />
          <meshBasicMaterial
            color={LOGO_BLUE}
            transparent
            opacity={0}
            toneMapped={false}
            fog={false}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[4.4, 4.4]} />
          <meshBasicMaterial
            ref={glowMaterialRef}
            map={glowTexture}
            transparent
            opacity={0}
            blending={AdditiveBlending}
            toneMapped={false}
            fog={false}
            depthWrite={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}

export function TrailNodes({ scrollProgress, theme, onSelectApp }: TrailNodesProps) {
  return (
    <group>
      {APP_EXAMPLES.map((app) => (
        <TrailNode
          key={app.id}
          app={app}
          scrollProgress={scrollProgress}
          visible={theme === "dark" || theme === "light"}
          onSelectApp={onSelectApp}
        />
      ))}
    </group>
  );
}
