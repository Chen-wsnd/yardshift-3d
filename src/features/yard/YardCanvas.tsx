"use client";

import { Canvas } from "@react-three/fiber";
import { YardScene } from "./YardScene";

/**
 * Client-only Three.js canvas. Parent routes should load this via
 * next/dynamic with ssr: false so WebGL never runs on the server.
 */
export function YardCanvas() {
  return (
    <div className="h-full min-h-[420px] w-full bg-sky-200">
      <Canvas
        shadows
        camera={{ position: [11, 9, 13], fov: 42, near: 0.1, far: 120 }}
        gl={{ antialias: true, toneMappingExposure: 1.05 }}
        dpr={[1, 1.75]}
      >
        <YardScene />
      </Canvas>
    </div>
  );
}
