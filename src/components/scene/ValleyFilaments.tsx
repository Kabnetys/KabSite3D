import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  CatmullRomCurve3,
  Color,
  Group,
  ShaderMaterial,
  TubeGeometry,
  Vector3,
} from "three";
import { getChapterZRange } from "@/lib/chapters";
import { valleyHeightAt, DEFAULT_VALLEY_CONFIG } from "@/lib/valleyTerrain";

interface ValleyFilamentsProps {
  scrollProgress: number;
}

const STRAND_COUNT = 2;
const SEGMENTS_PER_STRAND = 80;
const RADIAL_SEGMENTS = 8;
const STRAND_LATERAL_SPAN = 2.2;
const TUBE_RADIUS = 0.16;
const PULSE_SPEED = 3.2;
const PULSE_WIDTH = 0.18;
const TRAVEL_WINDOW = 28;
const FILAMENT_COLOR = new Color("#00b4ff");

interface StrandData {
  geometry: TubeGeometry;
  zStart: number;
  zEnd: number;
}

const VERTEX_SHADER = `
attribute float aWorldZ;
varying float vWorldZ;

void main() {
  vWorldZ = aWorldZ;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
uniform vec3 uColor;
uniform float uTravelZ;
uniform float uWindow;
uniform float uPhase;
uniform float uPulseWidth;
varying float vWorldZ;

void main() {
  float dist = abs(vWorldZ - uTravelZ);
  float window = 1.0 - smoothstep(0.0, uWindow, dist);
  float normalizedZ = vWorldZ / uWindow;
  float pulse = 0.5 + 0.5 * sin((normalizedZ - uPhase) / uPulseWidth);
  float intensity = window * (0.8 + pulse * 1.4);
  vec3 emissive = uColor * intensity;

  if (intensity < 0.02) discard;

  gl_FragColor = vec4(emissive, clamp(window, 0.0, 1.0));
}
`;

function buildStrands(): StrandData[] {
  const { min, max } = getChapterZRange();
  const zStart = max + 20;
  const zEnd = min - 20;
  const strands: StrandData[] = [];

  for (let i = 0; i < STRAND_COUNT; i += 1) {
    const offsetX = (i - (STRAND_COUNT - 1) / 2) * STRAND_LATERAL_SPAN;
    const points: Vector3[] = [];
    const zValues: number[] = [];
    for (let s = 0; s <= SEGMENTS_PER_STRAND; s += 1) {
      const t = s / SEGMENTS_PER_STRAND;
      const z = zStart + (zEnd - zStart) * t;
      const x = offsetX + Math.sin(t * 12 + i) * 0.6;
      const y = valleyHeightAt(x, z, DEFAULT_VALLEY_CONFIG) + 0.18;
      points.push(new Vector3(x, y, z));
      zValues.push(z);
    }
    const curve = new CatmullRomCurve3(points, false, "catmullrom", 0.3);
    const geometry = new TubeGeometry(curve, SEGMENTS_PER_STRAND, TUBE_RADIUS, RADIAL_SEGMENTS, false);

    const vertexCount = (SEGMENTS_PER_STRAND + 1) * (RADIAL_SEGMENTS + 1);
    const aWorldZ = new Float32Array(vertexCount);
    for (let ring = 0; ring <= SEGMENTS_PER_STRAND; ring += 1) {
      const t = ring / SEGMENTS_PER_STRAND;
      const z = zStart + (zEnd - zStart) * t;
      for (let radial = 0; radial <= RADIAL_SEGMENTS; radial += 1) {
        aWorldZ[ring * (RADIAL_SEGMENTS + 1) + radial] = z;
      }
    }
    geometry.setAttribute("aWorldZ", new BufferAttribute(aWorldZ, 1));

    strands.push({ geometry, zStart, zEnd });
  }

  return strands;
}

export function ValleyFilaments({ scrollProgress }: ValleyFilamentsProps) {
  const groupRef = useRef<Group>(null);
  const strands = useMemo(() => buildStrands(), []);
  const materialRefs = useRef<ShaderMaterial[]>([]);

  const uniforms = useMemo(
    () => ({
      uColor: { value: FILAMENT_COLOR },
      uTravelZ: { value: 0 },
      uWindow: { value: TRAVEL_WINDOW },
      uPhase: { value: 0 },
      uPulseWidth: { value: PULSE_WIDTH },
    }),
    [],
  );

  useFrame(() => {
    if (!groupRef.current) return;
    const { min, max } = getChapterZRange();
    const zStart = max + 20;
    const zEnd = min - 20;
    const travelZ = zStart + (zEnd - zStart) * scrollProgress;
    const phase = scrollProgress * PULSE_SPEED;

    materialRefs.current.forEach((material) => {
      if (!material) return;
      material.uniforms.uTravelZ.value = travelZ;
      material.uniforms.uPhase.value = phase;
    });
  });

  return (
    <group ref={groupRef}>
      {strands.map((strand, i) => (
        <mesh key={`filament-${i}`} geometry={strand.geometry}>
          <shaderMaterial
            ref={(material: ShaderMaterial | null) => {
              if (material) materialRefs.current[i] = material;
            }}
            uniforms={uniforms}
            vertexShader={VERTEX_SHADER}
            fragmentShader={FRAGMENT_SHADER}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
