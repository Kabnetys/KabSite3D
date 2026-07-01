export type DistrictStyle =
  | "modular"
  | "glass"
  | "industrial"
  | "tower"
  | "twinTowers"
  | "plain";

export interface BuildingVolume {
  key: string;
  width: number;
  height: number;
  depth: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  metalness: number;
  roughness: number;
  emissiveIntensity: number;
}

export interface BuildingSpec {
  key: string;
  offsetX: number;
  offsetZ: number;
  volumes: BuildingVolume[];
  hasCornice: boolean;
  neonAccent: "band" | "grid" | "cables" | "floors" | "portrait";
}

const DISTRICT_STYLE_BY_INDEX: DistrictStyle[] = [
  "plain",
  "modular",
  "glass",
  "industrial",
  "tower",
  "twinTowers",
  "plain",
];

export function getDistrictStyle(index: number): DistrictStyle {
  return DISTRICT_STYLE_BY_INDEX[index] ?? "plain";
}

function seededRandom(seed: number): () => number {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function buildModular(seed: number, i: number): BuildingSpec {
  const rand = seededRandom(seed + i * 31 + 1);
  const blockCount = 2 + Math.floor(rand() * 2);
  const baseHeight = 4 + rand() * 3;
  const volumes: BuildingVolume[] = [];
  let stackY = 0;
  for (let b = 0; b < blockCount; b += 1) {
    const height = baseHeight * (1 - b * 0.22) + rand() * 1.5;
    const width = 3.2 - b * 0.5 + rand() * 0.6;
    const depth = 3 - b * 0.4 + rand() * 0.4;
    volumes.push({
      key: `block-${b}`,
      width,
      height,
      depth,
      offsetX: (rand() - 0.5) * 1.2,
      offsetY: stackY + height / 2,
      offsetZ: (rand() - 0.5) * 1.2,
      metalness: 0.35,
      roughness: 0.55,
      emissiveIntensity: 0.3 + rand() * 0.5,
    });
    stackY += height;
  }
  return {
    key: `modular-${i}`,
    offsetX: ((seed + i * 31) % 7 - 3) * 6,
    offsetZ: ((seed + i * 31) % 5 - 2) * 5,
    volumes,
    hasCornice: true,
    neonAccent: "grid",
  };
}

function buildGlass(seed: number, i: number): BuildingSpec {
  const rand = seededRandom(seed + i * 41 + 2);
  const height = 8 + rand() * 6;
  const width = 2.2 + rand() * 0.6;
  const depth = 2.2 + rand() * 0.6;
  const volumes: BuildingVolume[] = [
    {
      key: "shaft",
      width,
      height,
      depth,
      offsetX: 0,
      offsetY: height / 2,
      offsetZ: 0,
      metalness: 0.7,
      roughness: 0.15,
      emissiveIntensity: 0.25 + rand() * 0.3,
    },
    {
      key: "spire",
      width: width * 0.3,
      height: 1.5 + rand(),
      depth: depth * 0.3,
      offsetX: 0,
      offsetY: height + (1.5 + rand()) / 2,
      offsetZ: 0,
      metalness: 0.9,
      roughness: 0.05,
      emissiveIntensity: 0.8,
    },
  ];
  return {
    key: `glass-${i}`,
    offsetX: ((seed + i * 41) % 7 - 3) * 6,
    offsetZ: ((seed + i * 41) % 5 - 2) * 5,
    volumes,
    hasCornice: false,
    neonAccent: "band",
  };
}

function buildIndustrial(seed: number, i: number): BuildingSpec {
  const rand = seededRandom(seed + i * 53 + 3);
  const height = 3 + rand() * 3;
  const volumes: BuildingVolume[] = [
    {
      key: "base",
      width: 3 + rand(),
      height,
      depth: 2.5 + rand(),
      offsetX: 0,
      offsetY: height / 2,
      offsetZ: 0,
      metalness: 0.5,
      roughness: 0.7,
      emissiveIntensity: 0.3 + rand() * 0.4,
    },
    {
      key: "tank",
      width: 1.4,
      height: 1.4,
      depth: 1.4,
      offsetX: 2 + rand(),
      offsetY: height + 0.7,
      offsetZ: rand() * 1.5 - 0.75,
      metalness: 0.6,
      roughness: 0.4,
      emissiveIntensity: 0.5,
    },
  ];
  return {
    key: `industrial-${i}`,
    offsetX: ((seed + i * 53) % 7 - 3) * 6,
    offsetZ: ((seed + i * 53) % 5 - 2) * 5,
    volumes,
    hasCornice: false,
    neonAccent: "cables",
  };
}

function buildTower(seed: number, i: number): BuildingSpec {
  const rand = seededRandom(seed + i * 67 + 4);
  const floorHeight = 3.4;
  const floors = 4;
  const volumes: BuildingVolume[] = Array.from({ length: floors }, (_, f) => ({
    key: `floor-${f}`,
    width: 4.2 - f * 0.1,
    height: floorHeight,
    depth: 4.2 - f * 0.1,
    offsetX: 0,
    offsetY: floorHeight * f + floorHeight / 2,
    offsetZ: 0,
    metalness: 0.4,
    roughness: 0.5,
    emissiveIntensity: f === 2 ? 0.9 : 0.35 + rand() * 0.2,
  }));
  return {
    key: `tower-${i}`,
    offsetX: 0,
    offsetZ: 0,
    volumes,
    hasCornice: true,
    neonAccent: "floors",
  };
}

function buildTwinTowers(seed: number, i: number): BuildingSpec {
  const rand = seededRandom(seed + i * 79 + 5);
  const isKyllian = i === 0;
  const height = 10 + rand() * 2;
  const volumes: BuildingVolume[] = isKyllian
    ? [
        {
          key: "shaft",
          width: 2.8,
          height,
          depth: 2.8,
          offsetX: 0,
          offsetY: height / 2,
          offsetZ: 0,
          metalness: 0.6,
          roughness: 0.2,
          emissiveIntensity: 0.55,
        },
        {
          key: "crown",
          width: 1.2,
          height: 2,
          depth: 1.2,
          offsetX: 0,
          offsetY: height + 1,
          offsetZ: 0,
          metalness: 0.7,
          roughness: 0.1,
          emissiveIntensity: 0.9,
        },
      ]
    : [
        {
          key: "shaft",
          width: 3,
          height: height * 0.85,
          depth: 3,
          offsetX: 0,
          offsetY: (height * 0.85) / 2,
          offsetZ: 0,
          metalness: 0.3,
          roughness: 0.6,
          emissiveIntensity: 0.4,
        },
        {
          key: "mast",
          width: 0.3,
          height: 3,
          depth: 0.3,
          offsetX: 0,
          offsetY: height * 0.85 + 1.5,
          offsetZ: 0,
          metalness: 0.8,
          roughness: 0.3,
          emissiveIntensity: 0.7,
        },
      ];
  return {
    key: `twin-${i}`,
    offsetX: isKyllian ? -6 : 6,
    offsetZ: 0,
    volumes,
    hasCornice: false,
    neonAccent: "portrait",
  };
}

function buildPlain(seed: number, i: number): BuildingSpec {
  const rand = seededRandom(seed + i * 19 + 6);
  const height = 4 + rand() * 8;
  const volumes: BuildingVolume[] = [
    {
      key: "base",
      width: 2.5 + rand() * 2,
      height,
      depth: 2.5 + rand() * 2,
      offsetX: 0,
      offsetY: height / 2,
      offsetZ: 0,
      metalness: 0.3,
      roughness: 0.6,
      emissiveIntensity: 0.3 + rand() * 0.4,
    },
  ];
  return {
    key: `plain-${i}`,
    offsetX: ((seed + i * 19) % 7 - 3) * 6,
    offsetZ: ((seed + i * 19) % 5 - 2) * 5,
    volumes,
    hasCornice: false,
    neonAccent: "band",
  };
}

const BUILDERS: Record<DistrictStyle, (seed: number, i: number) => BuildingSpec> = {
  modular: buildModular,
  glass: buildGlass,
  industrial: buildIndustrial,
  tower: buildTower,
  twinTowers: buildTwinTowers,
  plain: buildPlain,
};

export function generateDistrictBuildings(
  index: number,
  count: number
): BuildingSpec[] {
  const style = getDistrictStyle(index);
  const builder = BUILDERS[style];
  const seed = index * 97;
  const total = style === "tower" ? 1 : style === "twinTowers" ? 2 : count;
  return Array.from({ length: total }, (_, i) => builder(seed, i));
}
