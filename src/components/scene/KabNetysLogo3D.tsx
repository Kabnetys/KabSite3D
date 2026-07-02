import { useMemo } from "react";
import { useGLTF, Float, Text3D } from "@react-three/drei";
import { Box3, MeshStandardMaterial, Vector3 } from "three";

interface KabNetysLogo3DProps {
  float?: boolean;
}

const MODEL_URL = "/models/kabnetys-logo.glb";
const NETYS_FONT_URL = "/fonts/droid_sans_mono_regular.typeface.json";
const TARGET_SIZE = 4.5;
const BADGE_COLOR = "#04122e";
const NETYS_RGB = "225,255,255";

// The AI reconstruction (TripoSR) renders the "netys" wordmark as an
// illegible blur -- it isn't sharp text at that scale. Patch that region
// of the model with a solid panel matching its own background color, then
// overlay a crisp, real extruded Text3D "netys" on top instead. Positions
// are in the model's own local space (its bounding box is x:[-0.5,0.5],
// y:[-0.216,0.216], z:[-0.035,0.035], with "netys" sitting on the right
// ~45% of the badge).
const NETYS_PATCH_POSITION: [number, number, number] = [0.26, 0, 0.037];
const NETYS_PATCH_SIZE: [number, number, number] = [0.48, 0.34, 0.01];
const NETYS_TEXT_POSITION: [number, number, number] = [0.035, -0.065, 0.043];
const NETYS_TEXT_SIZE = 0.13;

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
      <mesh position={NETYS_PATCH_POSITION}>
        <boxGeometry args={NETYS_PATCH_SIZE} />
        <meshStandardMaterial color={BADGE_COLOR} emissive="#0a2a5e" emissiveIntensity={0.4} />
      </mesh>
      <group position={NETYS_TEXT_POSITION}>
        <Text3D
          font={NETYS_FONT_URL}
          size={NETYS_TEXT_SIZE}
          height={0.02}
          bevelEnabled
          bevelThickness={0.003}
          bevelSize={0.002}
          bevelSegments={3}
          curveSegments={8}
        >
          netys
          <meshStandardMaterial
            color={`rgb(${NETYS_RGB})`}
            emissive={`rgb(${NETYS_RGB})`}
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </Text3D>
      </group>
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
