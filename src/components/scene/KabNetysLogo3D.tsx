import { useMemo } from "react";
import { useGLTF, Float } from "@react-three/drei";
import { Box3, MeshStandardMaterial, Vector3 } from "three";

interface KabNetysLogo3DProps {
  float?: boolean;
}

const MODEL_URL = "/models/kabnetys-logo.glb";
const TARGET_SIZE = 4.5;

useGLTF.preload(MODEL_URL);

function LogoModel() {
  const { scene } = useGLTF(MODEL_URL);

  const { object, scale, center } = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (!("isMesh" in child) || !child.isMesh) return;
      const material = (child as unknown as { material: MeshStandardMaterial }).material;
      if (material?.map) {
        material.emissiveMap = material.map;
        material.emissive.set("#ffffff");
        material.emissiveIntensity = 1.1;
        material.toneMapped = false;
      }
    });

    const box = new Box3().setFromObject(clone);
    const size = new Vector3();
    box.getSize(size);
    const boxCenter = new Vector3();
    box.getCenter(boxCenter);
    const largestDimension = Math.max(size.x, size.y, size.z) || 1;

    return { object: clone, scale: TARGET_SIZE / largestDimension, center: boxCenter };
  }, [scene]);

  return (
    <group scale={scale}>
      <primitive object={object} position={[-center.x, -center.y, -center.z]} />
    </group>
  );
}

export function KabNetysLogo3D({ float = true }: KabNetysLogo3DProps) {
  if (!float) return <LogoModel />;
  return (
    <Float speed={1.3} rotationIntensity={0.22} floatIntensity={0.55}>
      <LogoModel />
    </Float>
  );
}
