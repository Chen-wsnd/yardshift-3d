"use client";

import { OrbitControls } from "@react-three/drei";
import { Fence } from "./Fence";
import { Ground } from "./Ground";
import { YardObjects } from "./YardObjects";

export function YardScene() {
  return (
    <>
      <color attach="background" args={["#b8d4e8"]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        castShadow
        position={[8, 14, 6]}
        intensity={1.15}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight args={["#cfe8ff", "#6b8f5a", 0.35]} />

      <Ground />
      <Fence />
      <YardObjects />

      <OrbitControls
        makeDefault
        enablePan
        minDistance={4}
        maxDistance={28}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.5, 0]}
      />
    </>
  );
}
