import { PALETTE } from "@/lib/palette";
import { DISTRICTS } from "@/lib/districts";

export function CityGround() {
  const firstZ = DISTRICTS[0].position[2];
  const lastZ = DISTRICTS[DISTRICTS.length - 1].position[2];
  const length = Math.abs(lastZ - firstZ) + 80;
  const centerZ = (firstZ + lastZ) / 2;

  return (
    <mesh position={[0, -0.5, centerZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[120, length]} />
      <meshStandardMaterial color={PALETTE.background} roughness={1} metalness={0} />
    </mesh>
  );
}
