import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { getCameraPositionAt, getLookAtPositionAt } from "@/lib/cameraPath";

interface CameraRigProps {
  scrollProgress: number;
  reducedMotion: boolean;
}

export function CameraRig({ scrollProgress, reducedMotion }: CameraRigProps) {
  const targetPosition = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());
  const currentLookAt = useRef(new Vector3());

  useFrame(({ camera }, delta) => {
    getCameraPositionAt(scrollProgress, targetPosition.current);
    getLookAtPositionAt(scrollProgress, targetLookAt.current);

    if (reducedMotion) {
      camera.position.copy(targetPosition.current);
      currentLookAt.current.copy(targetLookAt.current);
    } else {
      const smoothing = 1 - Math.exp(-6 * delta);
      camera.position.lerp(targetPosition.current, smoothing);
      currentLookAt.current.lerp(targetLookAt.current, smoothing);
    }

    camera.lookAt(currentLookAt.current);
  });

  return null;
}
