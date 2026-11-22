"use client";

import { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { MODEL_CATALOG } from "@/features/yard/assets/modelCatalog";

function MowerGlb({
  position,
  yaw,
  scale,
}: {
  position: [number, number, number];
  yaw: number;
  scale: number;
}) {
  const { scene } = useGLTF(MODEL_CATALOG.mower.localPath);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return (
    <primitive
      object={cloned}
      position={position}
      rotation={[0, yaw, 0]}
      scale={scale}
    />
  );
}

/** Visible mower that follows the player stroke. */
export function MowerTool({
  position,
  direction,
  powered,
}: {
  position: [number, number, number];
  direction: [number, number];
  powered: boolean;
}) {
  const yaw = Math.atan2(direction[0], direction[1]);
  const scale = powered ? 1.15 : 0.85;

  return (
    <Suspense
      fallback={
        <mesh position={position} rotation={[0, yaw, 0]}>
          <boxGeometry args={[powered ? 1.4 : 0.9, 0.45, powered ? 1.8 : 1.1]} />
          <meshStandardMaterial color={powered ? "#3a6" : "#555"} />
        </mesh>
      }
    >
      <MowerGlb position={position} yaw={yaw} scale={scale} />
      {powered ? (
        <mesh position={[position[0], 0.55, position[2]]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#f5d76e" emissive="#a80" />
        </mesh>
      ) : null}
    </Suspense>
  );
}

useGLTF.preload(MODEL_CATALOG.mower.localPath);
