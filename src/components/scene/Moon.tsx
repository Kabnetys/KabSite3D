import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { AdditiveBlending, CanvasTexture, Mesh, MeshBasicMaterial } from "three";
import { CHAPTERS } from "@/lib/chapters";
import { valleyHeightAt, DEFAULT_VALLEY_CONFIG } from "@/lib/valleyTerrain";
import type { SceneTheme } from "@/lib/theme";

interface MoonProps {
  theme: SceneTheme;
}

const HORIZON_CHAPTER_INDEX = 5;
const MOON_RADIUS = 9;
const MOON_X = 85;
const MOON_Z_OFFSET = -420;
const WATER_LEVEL_OFFSET = 3;

const MOON_Y = 150;
const SUN_Y = 220;
const MOON_COLOR = "255,252,240";
const SUN_COLOR = "255,244,214";

function buildGlowTexture(rgb: string): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, `rgba(${rgb},1)`);
    gradient.addColorStop(0.35, `rgba(${rgb},0.45)`);
    gradient.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
}

function buildStreakTexture(rgb: string): CanvasTexture {
  const width = 64;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const [r, g, b] = rgb.split(",").map(Number);
  if (ctx) {
    const image = ctx.createImageData(width, height);
    for (let y = 0; y < height; y += 1) {
      const v = y / height;
      const vAlpha = Math.pow(1 - v, 1.4);
      for (let x = 0; x < width; x += 1) {
        const u = x / width;
        const uAlpha = Math.max(0, 1 - Math.pow(Math.abs(u - 0.5) * 2, 1.6));
        const flicker = 0.75 + 0.25 * Math.sin(y * 0.9 + x * 1.7);
        const alpha = Math.max(0, Math.min(1, vAlpha * uAlpha * flicker));
        const idx = (y * width + x) * 4;
        image.data[idx] = r;
        image.data[idx + 1] = g;
        image.data[idx + 2] = b;
        image.data[idx + 3] = Math.round(alpha * 255);
      }
    }
    ctx.putImageData(image, 0, 0);
  }
  return new CanvasTexture(canvas);
}

export function Moon({ theme }: MoonProps) {
  const isDay = theme === "light";
  const rgb = isDay ? SUN_COLOR : MOON_COLOR;
  const bodyY = isDay ? SUN_Y : MOON_Y;

  const glowRef = useRef<Mesh>(null);
  const streakRef = useRef<Mesh>(null);

  const glowTexture = useMemo(() => buildGlowTexture(rgb), [rgb]);
  const streakTexture = useMemo(() => buildStreakTexture(rgb), [rgb]);

  const horizonChapter = CHAPTERS[HORIZON_CHAPTER_INDEX];
  const bodyZ = horizonChapter.position[2] + MOON_Z_OFFSET;
  const waterLevel =
    valleyHeightAt(0, horizonChapter.position[2] - 20, DEFAULT_VALLEY_CONFIG) + WATER_LEVEL_OFFSET;

  const streakNearZ = horizonChapter.position[2] - 10;
  const streakLength = Math.abs(bodyZ - streakNearZ);
  const streakCenterZ = (bodyZ + streakNearZ) / 2;

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (glowRef.current) {
      const scale = 1 + Math.sin(time * 0.6) * 0.03;
      glowRef.current.scale.setScalar(scale);
    }
    if (streakRef.current) {
      const material = streakRef.current.material as MeshBasicMaterial;
      const baseOpacity = isDay ? 0.3 : 0.55;
      const flickerRange = isDay ? 0.04 : 0.12;
      material.opacity = baseOpacity + Math.sin(time * 1.3) * flickerRange;
    }
  });

  return (
    <group>
      <mesh position={[MOON_X, bodyY, bodyZ]}>
        <sphereGeometry args={[MOON_RADIUS, 24, 24]} />
        <meshBasicMaterial color={`rgb(${rgb})`} toneMapped={false} fog={false} />
      </mesh>
      <Billboard position={[MOON_X, bodyY, bodyZ]}>
        <mesh ref={glowRef}>
          <planeGeometry args={[MOON_RADIUS * 6, MOON_RADIUS * 6]} />
          <meshBasicMaterial
            map={glowTexture}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
            fog={false}
          />
        </mesh>
      </Billboard>
      <mesh
        ref={streakRef}
        position={[MOON_X, waterLevel + 0.3, streakCenterZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[MOON_RADIUS * 2.4, streakLength]} />
        <meshBasicMaterial
          map={streakTexture}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
          fog={false}
          opacity={0.55}
        />
      </mesh>
    </group>
  );
}
