"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { KabNetysLogo3D } from "./KabNetysLogo3D";

interface LogoIntroProps {
  scrollProgress: number;
}

const FADE_END_PROGRESS = 0.05;

export function LogoIntro({ scrollProgress }: LogoIntroProps) {
  const t = Math.min(1, scrollProgress / FADE_END_PROGRESS);
  const opacity = 1 - t;
  const scale = 1 - t * 0.3;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center transition-opacity duration-300"
      style={{ opacity, visibility: opacity <= 0.01 ? "hidden" : "visible" }}
    >
      <div
        style={{
          width: "min(90vw, 700px)",
          height: "min(60vh, 480px)",
          transform: `scale(${scale})`,
        }}
      >
        <Canvas camera={{ position: [0, 0, 9], fov: 40 }} gl={{ alpha: true, antialias: true }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 4, 5]} intensity={1.6} />
          <Suspense fallback={null}>
            <KabNetysLogo3D />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
