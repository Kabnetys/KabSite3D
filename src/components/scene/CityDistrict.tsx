import { useMemo } from "react";
import { BoxGeometry, BufferGeometry, Vector3 } from "three";
import { PALETTE } from "@/lib/palette";
import type { District } from "@/lib/districts";
import {
  generateDistrictBuildings,
  getDistrictStyle,
  type BuildingSpec,
  type BuildingVolume,
} from "@/lib/districtBuildings";

interface CityDistrictProps {
  district: District;
  index: number;
}

function VolumeEdges({ volume }: { volume: BuildingVolume }) {
  const geometry = useMemo(
    () => new BoxGeometry(volume.width + 0.02, volume.height + 0.02, volume.depth + 0.02),
    [volume.width, volume.height, volume.depth]
  );

  return (
    <lineSegments position={[volume.offsetX, volume.offsetY, volume.offsetZ]}>
      <edgesGeometry args={[geometry]} />
      <lineBasicMaterial
        color={PALETTE.glow}
        transparent
        opacity={0.4 + volume.emissiveIntensity * 0.4}
      />
    </lineSegments>
  );
}

function Cornice({ volume }: { volume: BuildingVolume }) {
  const width = volume.width + 0.3;
  const depth = volume.depth + 0.3;
  return (
    <mesh position={[volume.offsetX, volume.offsetY + volume.height / 2 + 0.05, volume.offsetZ]}>
      <boxGeometry args={[width, 0.15, depth]} />
      <meshStandardMaterial
        color={PALETTE.neon}
        emissive={PALETTE.glow}
        emissiveIntensity={0.6}
        metalness={0.6}
        roughness={0.3}
      />
    </mesh>
  );
}

function BuildingVolumeMesh({ volume }: { volume: BuildingVolume }) {
  return (
    <mesh position={[volume.offsetX, volume.offsetY, volume.offsetZ]} castShadow receiveShadow>
      <boxGeometry args={[volume.width, volume.height, volume.depth]} />
      <meshStandardMaterial
        color={PALETTE.primary}
        emissive={PALETTE.neon}
        emissiveIntensity={volume.emissiveIntensity}
        metalness={volume.metalness}
        roughness={volume.roughness}
      />
    </mesh>
  );
}

function CableLink({ from, to }: { from: Vector3; to: Vector3 }) {
  const geometry = useMemo(() => new BufferGeometry().setFromPoints([from, to]), [from, to]);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={PALETTE.glow} transparent opacity={0.6} />
    </lineSegments>
  );
}

function CableLinks({ buildings }: { buildings: BuildingSpec[] }) {
  const links = useMemo(() => {
    const result: { key: string; from: Vector3; to: Vector3 }[] = [];
    for (let i = 0; i < buildings.length - 1; i += 1) {
      const a = buildings[i];
      const b = buildings[i + 1];
      const aTop = a.volumes[0].offsetY + a.volumes[0].height / 2;
      const bTop = b.volumes[0].offsetY + b.volumes[0].height / 2;
      result.push({
        key: `cable-${i}`,
        from: new Vector3(a.offsetX, aTop, a.offsetZ),
        to: new Vector3(b.offsetX, bTop, b.offsetZ),
      });
    }
    return result;
  }, [buildings]);

  return (
    <>
      {links.map((link) => (
        <CableLink key={link.key} from={link.from} to={link.to} />
      ))}
    </>
  );
}

function BuildingGroup({ building }: { building: BuildingSpec }) {
  return (
    <group position={[building.offsetX, 0, building.offsetZ]}>
      {building.volumes.map((volume) => (
        <BuildingVolumeMesh key={volume.key} volume={volume} />
      ))}
      {building.volumes.map((volume) => (
        <VolumeEdges key={`edges-${volume.key}`} volume={volume} />
      ))}
      {building.hasCornice &&
        building.volumes.map((volume) => (
          <Cornice key={`cornice-${volume.key}`} volume={volume} />
        ))}
      {building.volumes.map((volume) => (
        <pointLight
          key={`spot-${volume.key}`}
          position={[volume.offsetX, volume.offsetY + volume.height / 2 + 0.4, volume.offsetZ]}
          color={PALETTE.glow}
          intensity={volume.emissiveIntensity * 3}
          distance={9}
        />
      ))}
    </group>
  );
}

export function CityDistrict({ district, index }: CityDistrictProps) {
  const style = getDistrictStyle(index);
  const buildings = useMemo(() => generateDistrictBuildings(index, 6), [index]);
  const [x, y, z] = district.position;

  return (
    <group position={[x, 0, z]}>
      {buildings.map((building) => (
        <BuildingGroup key={building.key} building={building} />
      ))}
      {style === "industrial" && <CableLinks buildings={buildings} />}
      <pointLight
        position={[0, y + 8, 0]}
        color={PALETTE.glow}
        intensity={5}
        distance={40}
      />
      <spotLight
        position={[0, y + 14, 6]}
        target-position={[0, y, 0]}
        color={PALETTE.neon}
        intensity={8}
        angle={0.5}
        penumbra={0.6}
        distance={45}
        castShadow
      />
    </group>
  );
}
