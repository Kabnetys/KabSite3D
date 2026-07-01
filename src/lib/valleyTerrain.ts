import { createNoise2D } from "simplex-noise";
import { BufferGeometry, Color, Float32BufferAttribute, PlaneGeometry } from "three";

export interface ValleyConfig {
  width: number;
  length: number;
  widthSegments: number;
  lengthSegments: number;
  noiseHeight: number;
  valleyDepth: number;
  valleyWidth: number;
  centerZ: number;
}

export const DEFAULT_VALLEY_CONFIG: ValleyConfig = {
  width: 400,
  length: 400,
  widthSegments: 120,
  lengthSegments: 120,
  noiseHeight: 11,
  valleyDepth: 20,
  valleyWidth: 26,
  centerZ: -180,
};

const noise2D = createNoise2D(() => 0.42);
const detailNoise2D = createNoise2D(() => 0.87);

export function valleyHeightAt(
  x: number,
  z: number,
  config: Pick<ValleyConfig, "noiseHeight" | "valleyDepth" | "valleyWidth">
): number {
  const n = noise2D(x * 0.015, z * 0.015);
  const detail = detailNoise2D(x * 0.08, z * 0.08) * 0.6;
  const ridge = n * config.noiseHeight + detail;
  const carve = config.valleyDepth * Math.exp(-(x * x) / (config.valleyWidth * config.valleyWidth));
  return ridge - carve;
}

function heightColor(height: number, roughnessTint: number): Color {
  const low = new Color("#0a0812");
  const mid = new Color("#2a2440");
  const high = new Color("#6a5a7a");
  const t = Math.min(1, Math.max(0, (height + 14) / 20));
  const color = t < 0.5 ? low.clone().lerp(mid, t * 2) : mid.clone().lerp(high, (t - 0.5) * 2);
  return color.lerp(new Color("#3a2a2a"), roughnessTint * 0.15);
}

const GRID_SPACING = 4;
const GRID_LINE_WIDTH = 0.12;

function gridLineFactor(x: number, z: number): number {
  const nx = Math.abs(((x % GRID_SPACING) + GRID_SPACING) % GRID_SPACING);
  const nz = Math.abs(((z % GRID_SPACING) + GRID_SPACING) % GRID_SPACING);
  const distX = Math.min(nx, GRID_SPACING - nx);
  const distZ = Math.min(nz, GRID_SPACING - nz);
  const dist = Math.min(distX, distZ);
  return dist < GRID_LINE_WIDTH ? 1 - dist / GRID_LINE_WIDTH : 0;
}

export function buildGroundGeometry(
  config: ValleyConfig,
  roughnessTint = 0
): BufferGeometry {
  const geometry = new PlaneGeometry(
    config.width,
    config.length,
    config.widthSegments,
    config.lengthSegments
  );
  geometry.rotateX(-Math.PI / 2);

  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);
  const color = new Color();
  const gridTint = new Color("#3fd6ff");

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const z = position.getZ(i) + config.centerZ;
    const y = valleyHeightAt(x, z, config);
    position.setY(i, y);
    color.copy(heightColor(y, roughnessTint));
    const grid = gridLineFactor(x, z) * 0.18;
    color.lerp(gridTint, grid);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const normal = geometry.attributes.normal;
  for (let i = 0; i < normal.count; i += 1) {
    const x = position.getX(i);
    const z = position.getZ(i) + config.centerZ;
    const jitter = detailNoise2D(x * 0.35, z * 0.35) * 0.08;
    normal.setX(i, normal.getX(i) + jitter);
    normal.setZ(i, normal.getZ(i) + jitter * 0.6);
  }
  normal.needsUpdate = true;

  return geometry;
}

export function computeValleyConfigForRange(
  base: ValleyConfig,
  zMin: number,
  zMax: number,
  margin = 80
): ValleyConfig {
  const span = zMax - zMin + margin * 2;
  const centerZ = (zMin + zMax) / 2;
  return { ...base, length: span, centerZ };
}

export function buildSkyGeometry(config: ValleyConfig): BufferGeometry {
  const geometry = new PlaneGeometry(
    config.width,
    config.length,
    Math.max(8, Math.floor(config.widthSegments / 6)),
    Math.max(8, Math.floor(config.lengthSegments / 6))
  );
  geometry.rotateX(Math.PI / 2);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const z = position.getZ(i) + config.centerZ;
    const y = valleyHeightAt(x, z, config) * 0.4 + 60;
    position.setY(i, y);
  }
  geometry.computeVertexNormals();
  return geometry;
}
