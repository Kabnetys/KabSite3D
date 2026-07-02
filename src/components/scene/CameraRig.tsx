import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import {
  getCameraPositionAt,
  getLookAtPositionAt,
  WATER_SAFE_MIN_Y,
  WATER_ZONE_START_Z,
} from "@/lib/cameraPath";
import { valleyHeightAt, DEFAULT_VALLEY_CONFIG } from "@/lib/valleyTerrain";
import type { MouseParallax } from "@/hooks/useMouseParallax";

interface CameraRigProps {
  scrollProgress: number;
  reducedMotion: boolean;
  mouse: MutableRefObject<MouseParallax>;
}

const MAX_YAW_OFFSET = (4 * Math.PI) / 180;
const MAX_POSITION_DRIFT_X = 1.4;
const MAX_POSITION_DRIFT_Y = 0.8;
// Minimum clearance above the local terrain surface, checked every frame
// after mouse drift is applied -- the base path already keeps this much
// clearance, but pointing the mouse toward the bottom of the screen could
// push the camera down into a nearby ridge without it.
const MIN_GROUND_CLEARANCE = 3;

export function CameraRig({ scrollProgress, reducedMotion, mouse }: CameraRigProps) {
  const targetPosition = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());
  const currentLookAt = useRef(new Vector3());
  const mouseOffset = useRef(new Vector3());
  const positionDrift = useRef(new Vector3());

  useFrame(({ camera }, delta) => {
    getCameraPositionAt(scrollProgress, targetPosition.current);
    getLookAtPositionAt(scrollProgress, targetLookAt.current);

    if (reducedMotion) {
      camera.position.copy(targetPosition.current);
      currentLookAt.current.copy(targetLookAt.current);
      camera.lookAt(currentLookAt.current);
      return;
    }

    const smoothing = 1 - Math.exp(-6 * delta);
    camera.position.lerp(targetPosition.current, smoothing);

    const mouseSmoothing = 1 - Math.exp(-1.2 * delta);
    const desiredX = mouse.current.x * MAX_YAW_OFFSET * 12;
    const desiredY = -mouse.current.y * MAX_YAW_OFFSET * 6;
    mouseOffset.current.x += (desiredX - mouseOffset.current.x) * mouseSmoothing;
    mouseOffset.current.y += (desiredY - mouseOffset.current.y) * mouseSmoothing;

    const desiredDriftX = mouse.current.x * MAX_POSITION_DRIFT_X;
    const desiredDriftY = -mouse.current.y * MAX_POSITION_DRIFT_Y;
    positionDrift.current.x += (desiredDriftX - positionDrift.current.x) * mouseSmoothing;
    positionDrift.current.y += (desiredDriftY - positionDrift.current.y) * mouseSmoothing;
    camera.position.x += positionDrift.current.x;
    camera.position.y += positionDrift.current.y;

    // The mouse drift above isn't aware of the terrain or the water zone,
    // so it could push the camera below the water surface near the Horizon
    // finale, or straight into a nearby ridge anywhere else. Re-clamp
    // afterward instead of skipping drift, so the mouse still has an effect
    // but can never dip the camera underground or underwater.
    if (camera.position.z <= WATER_ZONE_START_Z) {
      camera.position.y = Math.max(camera.position.y, WATER_SAFE_MIN_Y);
    } else {
      const groundY = valleyHeightAt(camera.position.x, camera.position.z, DEFAULT_VALLEY_CONFIG);
      camera.position.y = Math.max(camera.position.y, groundY + MIN_GROUND_CLEARANCE);
    }

    currentLookAt.current.lerp(targetLookAt.current, smoothing);
    camera.lookAt(
      currentLookAt.current.x + mouseOffset.current.x,
      currentLookAt.current.y + mouseOffset.current.y,
      currentLookAt.current.z
    );
  });

  return null;
}
