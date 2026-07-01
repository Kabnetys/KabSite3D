import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { getCameraPositionAt, getLookAtPositionAt } from "@/lib/cameraPath";
import type { MouseParallax } from "@/hooks/useMouseParallax";

interface CameraRigProps {
  scrollProgress: number;
  reducedMotion: boolean;
  mouse: MutableRefObject<MouseParallax>;
}

const MAX_YAW_OFFSET = (4 * Math.PI) / 180;

export function CameraRig({ scrollProgress, reducedMotion, mouse }: CameraRigProps) {
  const targetPosition = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());
  const currentLookAt = useRef(new Vector3());
  const mouseOffset = useRef(new Vector3());

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

    currentLookAt.current.lerp(targetLookAt.current, smoothing);
    camera.lookAt(
      currentLookAt.current.x + mouseOffset.current.x,
      currentLookAt.current.y + mouseOffset.current.y,
      currentLookAt.current.z
    );
  });

  return null;
}
