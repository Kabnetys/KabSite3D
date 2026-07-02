import { createNoise2D } from "simplex-noise";
import { BufferGeometry, PlaneGeometry } from "three";

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

const COAST_FALLOFF_START_Z = -80;
const COAST_FALLOFF_END_Z = -210;
const COAST_MIN_RIDGE_SCALE = 0;

const EDGE_FALLOFF_START_X = 60;
const EDGE_FALLOFF_END_X = 150;
const EDGE_MIN_RIDGE_SCALE = 0;

function coastalRidgeScale(z: number): number {
  const t = Math.min(
    1,
    Math.max(0, (COAST_FALLOFF_START_Z - z) / (COAST_FALLOFF_START_Z - COAST_FALLOFF_END_Z))
  );
  const smooth = t * t * (3 - 2 * t);
  return 1 - smooth * (1 - COAST_MIN_RIDGE_SCALE);
}

function edgeRidgeScale(x: number): number {
  const ax = Math.abs(x);
  const t = Math.min(
    1,
    Math.max(0, (ax - EDGE_FALLOFF_START_X) / (EDGE_FALLOFF_END_X - EDGE_FALLOFF_START_X))
  );
  const smooth = t * t * (3 - 2 * t);
  return 1 - smooth * (1 - EDGE_MIN_RIDGE_SCALE);
}

export function valleyHeightAt(
  x: number,
  z: number,
  config: Pick<ValleyConfig, "noiseHeight" | "valleyDepth" | "valleyWidth">
): number {
  const n = noise2D(x * 0.015, z * 0.015);
  const detail = detailNoise2D(x * 0.08, z * 0.08) * 2.8;
  const fineDetail = detailNoise2D(x * 0.22 + 100, z * 0.22 + 100) * 1.1;
  const ridge =
    (n * config.noiseHeight + detail + fineDetail) * coastalRidgeScale(z) * edgeRidgeScale(x);
  const carve = config.valleyDepth * Math.exp(-(x * x) / (config.valleyWidth * config.valleyWidth));
  return ridge - carve;
}

export function buildGroundGeometry(config: ValleyConfig): BufferGeometry {
  const geometry = new PlaneGeometry(
    config.width,
    config.length,
    config.widthSegments,
    config.lengthSegments
  );
  geometry.rotateX(-Math.PI / 2);

  const position = geometry.attributes.position;

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const z = position.getZ(i) + config.centerZ;
    const y = valleyHeightAt(x, z, config);
    position.setY(i, y);
  }

  geometry.computeVertexNormals();

  const normal = geometry.attributes.normal;
  for (let i = 0; i < normal.count; i += 1) {
    const x = position.getX(i);
    const z = position.getZ(i) + config.centerZ;
    const jitter = detailNoise2D(x * 0.35, z * 0.35) * 0.12;
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
