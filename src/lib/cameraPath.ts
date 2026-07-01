import { CatmullRomCurve3, Vector3 } from "three";
import { CHAPTERS } from "./chapters";
import { DEFAULT_VALLEY_CONFIG, valleyHeightAt } from "./valleyTerrain";

const HOVER_OFFSET = 8;
const LOOKAT_FORWARD = 45;
const LOOKAT_LATERAL_DAMPING = 0.5;
const MAX_PITCH_DROP = 10;
const SAMPLES_PER_CHAPTER = 6;

function terrainHeight(x: number, z: number): number {
  return valleyHeightAt(x, z, DEFAULT_VALLEY_CONFIG);
}

function interpolateXAt(z: number): number {
  for (let i = 0; i < CHAPTERS.length - 1; i += 1) {
    const a = CHAPTERS[i];
    const b = CHAPTERS[i + 1];
    const [ax, , az] = a.position;
    const [bx, , bz] = b.position;
    if (z <= az && z >= bz) {
      const span = bz - az;
      const t = span !== 0 ? (z - az) / span : 0;
      return ax + (bx - ax) * t;
    }
  }
  const last = CHAPTERS[CHAPTERS.length - 1];
  return last.position[0];
}

function buildCameraPoints(): Vector3[] {
  const points: Vector3[] = [];
  for (let i = 0; i < CHAPTERS.length - 1; i += 1) {
    const a = CHAPTERS[i];
    const b = CHAPTERS[i + 1];
    const [ax, , az] = a.position;
    const [bx, , bz] = b.position;
    const segments = i === CHAPTERS.length - 2 ? SAMPLES_PER_CHAPTER : SAMPLES_PER_CHAPTER - 1;
    for (let s = 0; s < segments; s += 1) {
      const t = s / SAMPLES_PER_CHAPTER;
      const x = ax + (bx - ax) * t;
      const camZ = az + (bz - az) * t + 8;
      const y = terrainHeight(x, camZ) + HOVER_OFFSET;
      points.push(new Vector3(x, y, camZ));
    }
  }
  const lastChapter = CHAPTERS[CHAPTERS.length - 1];
  const [lx, , lz] = lastChapter.position;
  const lastCamZ = lz + 8;
  points.push(new Vector3(lx, terrainHeight(lx, lastCamZ) + HOVER_OFFSET, lastCamZ));
  return points;
}

function buildLookAtPoints(): Vector3[] {
  return buildCameraPoints().map((point) => {
    const lookZ = point.z - LOOKAT_FORWARD;
    const lookX = interpolateXAt(lookZ) * LOOKAT_LATERAL_DAMPING + point.x * (1 - LOOKAT_LATERAL_DAMPING);
    const groundLookY = terrainHeight(lookX, lookZ);
    const lookY = Math.max(groundLookY, point.y - MAX_PITCH_DROP);
    return new Vector3(lookX, lookY, lookZ);
  });
}

export const cameraCurve = new CatmullRomCurve3(buildCameraPoints(), false, "catmullrom", 0.4);
export const lookAtCurve = new CatmullRomCurve3(buildLookAtPoints(), false, "catmullrom", 0.4);

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function getCameraPositionAt(progress: number, out: Vector3): void {
  cameraCurve.getPoint(clamp01(progress), out);
}

export function getLookAtPositionAt(progress: number, out: Vector3): void {
  lookAtCurve.getPoint(clamp01(progress), out);
}
