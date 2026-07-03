import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import {
  AdditiveBlending,
  CatmullRomCurve3,
  Group,
  Mesh,
  MeshBasicMaterial,
  ShaderMaterial,
  TubeGeometry,
  Vector3,
} from "three";
import { getCameraPositionAt, getLookAtPositionAt } from "@/lib/cameraPath";
import { SPLIT_START, getBranchGrowth } from "@/lib/scrollPhases";
import { APP_EXAMPLES, type AppExample } from "@/lib/appExamples";
import { buildRadialGlowTexture } from "@/lib/glowTexture";

interface TrailSplitProps {
  splitPhase: number;
  onSelectApp: (app: AppExample) => void;
}

// While the camera is frozen (see scrollPhases.ts), the single light ribbon
// fans out into three branches spanning the screen width -- left, center,
// right on the same line -- each ending in a glowing interactive stop that
// opens an example application. As the scroll continues the growth reverses
// and the three become one again.

const BRANCH_DISTANCE = 13;
const BRANCH_SPREAD = 7.5;
const BRANCH_LIFT = 0.6;
const ORIGIN_AHEAD = 5;
const ORIGIN_DROP = 1.6;
const LOGO_BLUE = "#39c8ff";

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform float uGrow;
uniform float uTime;
varying vec2 vUv;

void main() {
  if (vUv.x > uGrow) discard;
  float tip = smoothstep(uGrow - 0.22, uGrow, vUv.x);
  float streaks = 0.75 + 0.25 * sin(vUv.x * 90.0 - uTime * 5.0);
  vec3 tailColor = vec3(0.0, 0.40, 1.0);
  vec3 headColor = vec3(0.55, 0.88, 1.0);
  vec3 color = mix(tailColor, headColor, tip);
  float intensity = (0.5 + 0.5 * tip) * streaks;
  gl_FragColor = vec4(color * intensity * 1.7, intensity);
}
`;

function setCursor(pointer: boolean) {
  if (typeof document !== "undefined") {
    document.body.style.cursor = pointer ? "pointer" : "";
  }
}

interface SplitLayout {
  origin: Vector3;
  targets: Vector3[];
}

function buildLayout(): SplitLayout {
  const camPos = new Vector3();
  const lookAt = new Vector3();
  getCameraPositionAt(SPLIT_START, camPos);
  getLookAtPositionAt(SPLIT_START, lookAt);
  const forward = lookAt.clone().sub(camPos).normalize();
  const right = forward.clone().cross(new Vector3(0, 1, 0)).normalize();

  const origin = camPos
    .clone()
    .addScaledVector(forward, ORIGIN_AHEAD)
    .add(new Vector3(0, -ORIGIN_DROP, 0));

  const lineCenter = camPos.clone().addScaledVector(forward, BRANCH_DISTANCE);
  lineCenter.y = camPos.y + BRANCH_LIFT;

  const targets = [-1, 0, 1].map((side) =>
    lineCenter.clone().addScaledVector(right, side * BRANCH_SPREAD)
  );

  return { origin, targets };
}

function buildBranchGeometry(origin: Vector3, target: Vector3): TubeGeometry {
  const mid = origin.clone().lerp(target, 0.45);
  mid.y += 1.1;
  const dip = origin.clone().lerp(target, 0.2);
  dip.y -= 0.3;
  const curve = new CatmullRomCurve3([origin.clone(), dip, mid, target.clone()], false, "catmullrom", 0.6);
  return new TubeGeometry(curve, 60, 0.11, 8, false);
}

interface BranchProps {
  app: AppExample;
  geometry: TubeGeometry;
  target: Vector3;
  splitPhase: number;
  interactive: boolean;
  onSelectApp: (app: AppExample) => void;
}

function Branch({ app, geometry, target, splitPhase, interactive, onSelectApp }: BranchProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const nodeRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  const glowMaterialRef = useRef<MeshBasicMaterial>(null);
  const glowTexture = useMemo(() => buildRadialGlowTexture("57,200,255"), []);

  const uniforms = useMemo(
    () => ({
      uGrow: { value: 0 },
      uTime: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    const growth = getBranchGrowth(splitPhase);
    const time = clock.elapsedTime;

    if (materialRef.current) {
      materialRef.current.uniforms.uGrow.value = growth;
      materialRef.current.uniforms.uTime.value = time;
    }

    if (nodeRef.current) {
      const nodeVisibility = Math.max(0, (growth - 0.85) / 0.15);
      nodeRef.current.visible = nodeVisibility > 0.01;
      const pulse = 1 + Math.sin(time * 2.6 + target.x) * 0.12;
      nodeRef.current.scale.setScalar(nodeVisibility * pulse);

      if (ringRef.current) {
        const cycle = (time * 0.6 + target.x * 0.1) % 1;
        ringRef.current.scale.setScalar(1.1 + cycle * 1.4);
        (ringRef.current.material as MeshBasicMaterial).opacity =
          Math.max(0, 0.6 * (1 - cycle)) * nodeVisibility;
      }
      if (glowMaterialRef.current) {
        glowMaterialRef.current.opacity = 0.75 * nodeVisibility;
      }
    }
  });

  return (
    <group>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <group ref={nodeRef} position={target}>
        <mesh
          onClick={(event) => {
            if (!interactive) return;
            event.stopPropagation();
            onSelectApp(app);
            setCursor(false);
          }}
          onPointerOver={(event) => {
            if (!interactive) return;
            event.stopPropagation();
            setCursor(true);
          }}
          onPointerOut={() => setCursor(false)}
        >
          <sphereGeometry args={[0.5, 20, 20]} />
          <meshBasicMaterial color={LOGO_BLUE} toneMapped={false} fog={false} />
        </mesh>
        <Billboard>
          <mesh ref={ringRef}>
            <ringGeometry args={[0.68, 0.76, 40]} />
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
            <planeGeometry args={[4, 4]} />
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
    </group>
  );
}

export function TrailSplit({ splitPhase, onSelectApp }: TrailSplitProps) {
  const { geometries, targets } = useMemo(() => {
    const layout = buildLayout();
    return {
      geometries: layout.targets.map((target) => buildBranchGeometry(layout.origin, target)),
      targets: layout.targets,
    };
  }, []);

  const interactive = getBranchGrowth(splitPhase) > 0.95;

  if (splitPhase <= 0 || splitPhase >= 1) return null;

  return (
    <group>
      {APP_EXAMPLES.map((app, index) => (
        <Branch
          key={app.id}
          app={app}
          geometry={geometries[index]}
          target={targets[index]}
          splitPhase={splitPhase}
          interactive={interactive}
          onSelectApp={onSelectApp}
        />
      ))}
    </group>
  );
}
