import { useMemo } from "react";
import { BoxGeometry } from "three";
import { PALETTE } from "@/lib/palette";
import type { District } from "@/lib/districts";

interface CityDistrictProps {
  district: District;
  index: number;
}

interface Building {
  height: number;
  width: number;
  depth: number;
  offsetX: number;
  offsetZ: number;
  key: string;
}

function DistrictBuildingEdges({ building }: { building: Building }) {
  const boxGeometry = useMemo(
    () => new BoxGeometry(building.width + 0.02, building.height + 0.02, building.depth + 0.02),
    [building.width, building.height, building.depth]
  );

  return (
    <lineSegments position={[building.offsetX, building.height / 2, building.offsetZ]}>
      <edgesGeometry args={[boxGeometry]} />
      <lineBasicMaterial color={PALETTE.glow} />
    </lineSegments>
  );
}

function useDistrictBuildings(index: number, count: number) {
  return useMemo(() => {
    const seed = index * 97;
    return Array.from({ length: count }, (_, i) => {
      const n = seed + i * 31;
      const height = 4 + ((n * 13) % 10);
      const width = 2 + ((n * 7) % 3);
      const depth = 2 + ((n * 5) % 3);
      const offsetX = ((n % 7) - 3) * 6;
      const offsetZ = ((n % 5) - 2) * 5;
      return { height, width, depth, offsetX, offsetZ, key: `${index}-${i}` };
    });
  }, [index, count]);
}

export function CityDistrict({ district, index }: CityDistrictProps) {
  const buildings = useDistrictBuildings(index, 6);
  const [x, y, z] = district.position;

  return (
    <group position={[x, 0, z]}>
      {buildings.map((building) => (
        <mesh
          key={building.key}
          position={[building.offsetX, building.height / 2, building.offsetZ]}
        >
          <boxGeometry args={[building.width, building.height, building.depth]} />
          <meshStandardMaterial
            color={PALETTE.primary}
            emissive={PALETTE.neon}
            emissiveIntensity={0.35}
            wireframe={false}
            roughness={0.6}
            metalness={0.3}
          />
        </mesh>
      ))}
      {buildings.map((building) => (
        <DistrictBuildingEdges key={`edges-${building.key}`} building={building} />
      ))}
      <pointLight
        position={[0, y + 8, 0]}
        color={PALETTE.glow}
        intensity={6}
        distance={40}
      />
    </group>
  );
}
