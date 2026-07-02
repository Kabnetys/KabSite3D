import { Vector3 } from "three";
import { CHAPTERS } from "./chapters";
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

// Anchors a text panel directly in the camera's view for a given chapter's
// held viewpoint (the scroll-hold position from remapScrollForStops), so it
// reads clearly during the pause instead of sitting off to the side where
// it's only glimpsed when the mouse-driven camera drift happens to swing
// past it.
export function computeChapterPanelTransform(
  chapterIndex: number,
  distance: number,
  lateral: number,
  vertical: number
): ChapterPanelTransform {
  const chapter = CHAPTERS[chapterIndex];
  getCameraPositionAt(chapter.scrollProgress, camPos);
  getLookAtPositionAt(chapter.scrollProgress, lookAtPos);
  forward.subVectors(lookAtPos, camPos).normalize();
  right.crossVectors(forward, worldUp).normalize();

  panelPos.copy(camPos).addScaledVector(forward, distance).addScaledVector(right, lateral);
  panelPos.y += vertical;

  toCam.subVectors(camPos, panelPos);
  const rotationY = Math.atan2(toCam.x, toCam.z);

  return { position: [panelPos.x, panelPos.y, panelPos.z], rotationY };
}
