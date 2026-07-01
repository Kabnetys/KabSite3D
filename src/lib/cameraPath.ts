import { CatmullRomCurve3, Vector3 } from "three";
import { CHAPTERS } from "./chapters";

function buildCameraPoints(): Vector3[] {
  return CHAPTERS.map((chapter) => {
    const [x, y, z] = chapter.position;
    return new Vector3(x, y + 2.4, z + 8);
  });
}

function buildLookAtPoints(): Vector3[] {
  return CHAPTERS.map((chapter) => {
    const [x, y, z] = chapter.position;
    return new Vector3(x, y - 3, z - 14);
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
