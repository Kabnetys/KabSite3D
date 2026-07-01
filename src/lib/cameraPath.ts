import { CatmullRomCurve3, Vector3 } from "three";
import { DISTRICTS } from "./districts";

function buildCameraPoints(): Vector3[] {
  return DISTRICTS.map((district) => {
    const [x, y, z] = district.position;
    return new Vector3(x, y + 6, z + 10);
  });
}

function buildLookAtPoints(): Vector3[] {
  return DISTRICTS.map((district) => {
    const [x, y, z] = district.position;
    return new Vector3(x, y, z);
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
