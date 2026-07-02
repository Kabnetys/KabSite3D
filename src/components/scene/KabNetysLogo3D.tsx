import { useMemo } from "react";
import { useTexture, Float } from "@react-three/drei";
import { BufferAttribute, DoubleSide, PlaneGeometry, SRGBColorSpace, Texture } from "three";

interface KabNetysLogo3DProps {
  float?: boolean;
}

const IMAGE_URL = "/textures/logo/kabnetys-logo.webp";
const IMAGE_ASPECT = 353 / 707;

// Sampling grid for the relief -- high enough to keep the neon line detail
// (the thin double-stroke outlines) crisp when displaced.
const GRID_X = 180;
const GRID_Y = Math.round(GRID_X * IMAGE_ASPECT);
const PLANE_WIDTH = 6;
const PLANE_HEIGHT = PLANE_WIDTH * IMAGE_ASPECT;
const MIN_DEPTH = 0.015;
const MAX_DEPTH = 0.24;
const BACKING_DEPTH = 0.05;

function sampleAlpha(image: TexImageSource): Uint8ClampedArray {
  const canvas = document.createElement("canvas");
  canvas.width = GRID_X + 1;
  canvas.height = GRID_Y + 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Uint8ClampedArray((GRID_X + 1) * (GRID_Y + 1) * 4);
  ctx.drawImage(image as CanvasImageSource, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
}

function buildReliefGeometry(pixels: Uint8ClampedArray): PlaneGeometry {
  const geometry = new PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT, GRID_X, GRID_Y);
  const position = geometry.attributes.position as BufferAttribute;
  const uv = geometry.attributes.uv as BufferAttribute;
  const width = GRID_X + 1;

  for (let i = 0; i < position.count; i += 1) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    const px = Math.min(GRID_X, Math.round(u * GRID_X));
    const py = Math.min(GRID_Y, Math.round((1 - v) * GRID_Y));
    const alpha = pixels[(py * width + px) * 4 + 3] / 255;
    position.setZ(i, MIN_DEPTH + alpha * (MAX_DEPTH - MIN_DEPTH));
  }

  geometry.computeVertexNormals();
  return geometry;
}

function LogoModel() {
  const texture = useTexture(IMAGE_URL, (loaded) => {
    (loaded as Texture).colorSpace = SRGBColorSpace;
  });

  const reliefGeometry = useMemo(() => {
    const image = (texture as Texture).image as TexImageSource;
    const pixels = sampleAlpha(image);
    return buildReliefGeometry(pixels);
  }, [texture]);

  return (
    <group>
      {/* Solid backing so the relief reads as a real object, not a hollow
          cutout, when seen from a grazing angle. */}
      <mesh position={[0, 0, -BACKING_DEPTH / 2]}>
        <boxGeometry args={[PLANE_WIDTH * 0.94, PLANE_HEIGHT * 0.85, BACKING_DEPTH]} />
        <meshStandardMaterial color="#02102a" metalness={0.4} roughness={0.6} />
      </mesh>

      <mesh geometry={reliefGeometry}>
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={1.15}
          toneMapped={false}
          alphaTest={0.25}
          side={DoubleSide}
          roughness={0.45}
          metalness={0.25}
        />
      </mesh>
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
