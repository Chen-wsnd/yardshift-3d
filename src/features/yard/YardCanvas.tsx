"use client";

import { Canvas } from "@react-three/fiber";
import { YardScene } from "./YardScene";

/**
 * Client-only Three.js canvas. Parent routes should load this via
 * next/dynamic with ssr: false so WebGL never runs on the server.
 */
export function YardCanvas() {
  return (
    <div className="h-full min-h-[420px] w-full bg-sky-100">
      <Canvas
        shadows
        camera={{ position: [10, 8, 12], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: true }}
      >
        <YardScene />
      </Canvas>
    </div>
  );
}
