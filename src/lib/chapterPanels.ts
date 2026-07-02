import { Vector3 } from "three";
import { getCameraPositionAt, getLookAtPositionAt } from "./cameraPath";

export interface ChapterPanelTransform {
  position: [number, number, number];
  rotationY: number;
}

const worldUp = new Vector3(0, 1, 0);
const camPos = new Vector3();
const lookAtPos = new Vector3();
const forward = new Vector3();
const right = new Vector3();
const panelPos = new Vector3();
const toCam = new Vector3();

// Anchors a floating text/mockup panel directly in the camera's forward view
// at a given point along the continuous scroll (progress, 0..1), so it reads
// clearly as the camera flies past. Multiple panels can share the same
// chapter but use different `progress` values to stagger several short
// narrative beats one after another within that chapter's scroll span.
export function computePanelTransformAtProgress(
  progress: number,
  distance: number,
  lateral: number,
  vertical: number
): ChapterPanelTransform {
  getCameraPositionAt(progress, camPos);
  getLookAtPositionAt(progress, lookAtPos);
  forward.subVectors(lookAtPos, camPos).normalize();
  right.crossVectors(forward, worldUp).normalize();

  panelPos.copy(camPos).addScaledVector(forward, distance).addScaledVector(right, lateral);
  panelPos.y += vertical;

  toCam.subVectors(camPos, panelPos);
  const rotationY = Math.atan2(toCam.x, toCam.z);

  return { position: [panelPos.x, panelPos.y, panelPos.z], rotationY };
}
