import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, CatmullRomCurve3, ShaderMaterial, TubeGeometry, Vector3 } from "three";
import { getCameraPositionAt } from "@/lib/cameraPath";
import { CHAPTERS } from "@/lib/chapters";
import { valleyHeightAt, DEFAULT_VALLEY_CONFIG } from "@/lib/valleyTerrain";
import type { SceneTheme } from "@/lib/theme";

interface ValleyLightTrailProps {
  scrollProgress: number;
  theme: SceneTheme;
}

// hubtown.co.in's signature light: a bright ribbon of energy snaking along
// the canyon floor, whose glowing head travels with the scroll and drags a
// long fading tail behind it. Two co-axial tubes (thin white-hot core +
// wide soft blue halo) with an additive shader windowed around the head.

const TRAIL_SAMPLES = 160;
const TUBE_SEGMENTS = 320;
const CORE_RADIUS = 0.14;
const HALO_RADIUS = 0.55;
const FLOOR_LIFT = 1.4;
// How far (in curve-param space, 0..1) the tail stretches behind the head.
const TAIL_LENGTH = 0.22;
// The head runs slightly ahead of the camera so the light leads the way.
const HEAD_LEAD = 0.045;

const WATER_LEVEL =
  valleyHeightAt(0, CHAPTERS[CHAPTERS.length - 1].position[2] - 20, DEFAULT_VALLEY_CONFIG) + 3;

function buildTrailCurve(): CatmullRomCurve3 {
  const sample = new Vector3();
  const points: Vector3[] = [];
  for (let i = 0; i <= TRAIL_SAMPLES; i += 1) {
    const p = i / TRAIL_SAMPLES;
    getCameraPositionAt(p, sample);
    // Weave gently around the camera line so the ribbon reads organic,
    // hugging the valley floor rather than floating at camera height.
    const sway = Math.sin(p * 19) * 2.2 + Math.sin(p * 7 + 1.7) * 1.4;
    const x = sample.x + sway;
    const z = sample.z;
    const ground = valleyHeightAt(x, z, DEFAULT_VALLEY_CONFIG);
    const y = Math.max(ground + FLOOR_LIFT, WATER_LEVEL + 0.8);
    points.push(new Vector3(x, y, z));
  }
  return new CatmullRomCurve3(points, false, "catmullrom", 0.5);
}

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform float uHead;
uniform float uTail;
uniform float uTime;
uniform float uMaxOpacity;
varying vec2 vUv;

void main() {
  float behind = uHead - vUv.x;

  // Small soft tip just ahead of the head, long fading tail behind it.
  float window = 0.0;
  if (behind >= 0.0) {
    window = 1.0 - smoothstep(0.0, uTail, behind);
    window = pow(window, 1.6);
  } else {
    window = 1.0 - smoothstep(0.0, 0.015, -behind);
  }
  if (window < 0.01) discard;

  // Flowing energy streaks racing toward the head.
  float streaks = 0.72 + 0.28 * sin(vUv.x * 240.0 - uTime * 6.0);
  float pulse = 0.9 + 0.1 * sin(uTime * 2.1 + vUv.x * 30.0);

  // White-hot near the head, deep electric blue down the tail.
  vec3 headColor = vec3(0.86, 0.95, 1.0);
  vec3 tailColor = vec3(0.10, 0.42, 1.0);
  vec3 color = mix(tailColor, headColor, window);

  float intensity = window * streaks * pulse;
  gl_FragColor = vec4(color * intensity * 1.6, intensity * uMaxOpacity);
}
`;

export function ValleyLightTrail({ scrollProgress, theme }: ValleyLightTrailProps) {
  const coreMaterialRef = useRef<ShaderMaterial>(null);
  const haloMaterialRef = useRef<ShaderMaterial>(null);

  const { coreGeometry, haloGeometry } = useMemo(() => {
    const curve = buildTrailCurve();
    return {
      coreGeometry: new TubeGeometry(curve, TUBE_SEGMENTS, CORE_RADIUS, 8, false),
      haloGeometry: new TubeGeometry(curve, TUBE_SEGMENTS, HALO_RADIUS, 8, false),
    };
  }, []);

  const coreUniforms = useMemo(
    () => ({
      uHead: { value: 0 },
      uTail: { value: TAIL_LENGTH },
      uTime: { value: 0 },
      uMaxOpacity: { value: 0.95 },
    }),
    []
  );
  const haloUniforms = useMemo(
    () => ({
      uHead: { value: 0 },
      uTail: { value: TAIL_LENGTH * 1.15 },
      uTime: { value: 0 },
      uMaxOpacity: { value: 0.3 },
    }),
    []
  );

  useFrame(({ clock }) => {
    const head = Math.min(1, Math.max(0, scrollProgress + HEAD_LEAD));
    const time = clock.elapsedTime;
    const visible = theme === "dark";
    if (coreMaterialRef.current) {
      coreMaterialRef.current.uniforms.uHead.value = head;
      coreMaterialRef.current.uniforms.uTime.value = time;
      coreMaterialRef.current.uniforms.uMaxOpacity.value = visible ? 0.95 : 0;
    }
    if (haloMaterialRef.current) {
      haloMaterialRef.current.uniforms.uHead.value = head;
      haloMaterialRef.current.uniforms.uTime.value = time;
      haloMaterialRef.current.uniforms.uMaxOpacity.value = visible ? 0.3 : 0;
    }
  });

  return (
    <group>
      <mesh geometry={coreGeometry}>
        <shaderMaterial
          ref={coreMaterialRef}
          uniforms={coreUniforms}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={haloGeometry}>
        <shaderMaterial
          ref={haloMaterialRef}
          uniforms={haloUniforms}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
