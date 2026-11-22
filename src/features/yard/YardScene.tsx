"use client";

import { OrbitControls, Sky } from "@react-three/drei";
import { BaseDecor } from "./BaseDecor";
import { Fence } from "./Fence";
import { Ground } from "./Ground";
import { YardObjects } from "./YardObjects";

export function YardScene() {
  return (
    <>
      <color attach="background" args={["#c5daf0"]} />
      <Sky
        distance={450000}
        sunPosition={[6, 12, 4]}
        inclination={0.49}
        azimuth={0.25}
        mieCoefficient={0.004}
        rayleigh={1.2}
      />
      <ambientLight intensity={0.42} />
      <hemisphereLight args={["#d7e9ff", "#6b8f5a", 0.45]} />
      <directionalLight
        castShadow
        position={[9, 16, 7]}
        intensity={1.35}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={40}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-6, 8, -4]} intensity={0.25} color="#ffe6c8" />

      <Ground />
      <Fence />
      <BaseDecor />
      <YardObjects />

      <OrbitControls
        makeDefault
        enablePan
        minDistance={5}
        maxDistance={26}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 0.4, 0]}
        rotateSpeed={0.7}
        zoomSpeed={0.85}
      />
    </>
  );
}
