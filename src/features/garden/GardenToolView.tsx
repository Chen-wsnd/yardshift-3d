"use client";

import { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { MODEL_CATALOG } from "@/features/yard/assets/modelCatalog";

/**
 * Honest tool presentation:
 * - Kit GLBs only when they match the tool identity.
 * - hand-edger / hand-weeder use distinct procedural silhouettes
 *   (never string_trimmer / garden_shears masquerading).
 */
const KIT_MOUNT: Record<
  string,
  { catalog: keyof typeof MODEL_CATALOG; scale: number; y: number; yaw: number }
> = {
  "hand-hedge-shears": { catalog: "garden_shears", scale: 1.1, y: 0.15, yaw: 0 },
  "hedge-trimmer": { catalog: "hedge_trimmer", scale: 1.0, y: 0.1, yaw: Math.PI / 2 },
  rake: { catalog: "leaf_rake", scale: 1.0, y: 0.05, yaw: 0 },
  "leaf-blower": { catalog: "leaf_blower", scale: 1.0, y: 0.1, yaw: Math.PI },
  bag: { catalog: "grass_bag", scale: 1.0, y: 0.05, yaw: 0 },
  "string-trimmer": { catalog: "string_trimmer", scale: 1.0, y: 0.1, yaw: 0 },
};

/** Half-moon blade + upright handle — readable as a hand edger. */
function HandEdgerSilhouette({
  position,
  facingYaw,
}: {
  position: [number, number, number];
  facingYaw: number;
}) {
  return (
    <group
      position={[position[0], position[1] + 0.08, position[2]]}
      rotation={[0, facingYaw, 0]}
    >
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.7, 8]} />
        <meshStandardMaterial color="#5c4033" />
      </mesh>
      <mesh position={[0.05, 0.02, 0]} rotation={[Math.PI / 2, 0, Math.PI / 5]}>
        <cylinderGeometry args={[0.14, 0.14, 0.04, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#8a8f98" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.08, 0.06, 0.04]} />
        <meshStandardMaterial color="#2f4f3a" />
      </mesh>
    </group>
  );
}

/** Narrow forked blade + short handle — readable as a hand weeder, not shears. */
function HandWeederSilhouette({
  position,
  facingYaw,
}: {
  position: [number, number, number];
  facingYaw: number;
}) {
  return (
    <group
      position={[position[0], position[1] + 0.05, position[2]]}
      rotation={[0, facingYaw, 0]}
    >
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.55, 8]} />
        <meshStandardMaterial color="#6b4f2a" />
      </mesh>
      <mesh position={[-0.04, 0.02, 0]} rotation={[0.15, 0, -0.2]}>
        <boxGeometry args={[0.03, 0.18, 0.015]} />
        <meshStandardMaterial color="#9aa0a8" metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh position={[0.04, 0.02, 0]} rotation={[0.15, 0, 0.2]}>
        <boxGeometry args={[0.03, 0.18, 0.015]} />
        <meshStandardMaterial color="#9aa0a8" metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.07, 0.05, 0.035]} />
        <meshStandardMaterial color="#3d5c45" />
      </mesh>
    </group>
  );
}

function FallbackToolMesh({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.35, 0.4, 0.15]} />
      <meshStandardMaterial color="#666" />
    </mesh>
  );
}

function CatalogToolMesh({
  mount,
  position,
  facingYaw,
}: {
  mount: (typeof KIT_MOUNT)[string];
  position: [number, number, number];
  facingYaw: number;
}) {
  const entry = MODEL_CATALOG[mount.catalog];
  const { scene } = useGLTF(entry.localPath);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return (
    <group
      position={[position[0], position[1] + mount.y, position[2]]}
      rotation={[0, facingYaw + mount.yaw, 0]}
      scale={mount.scale * entry.scale}
    >
      <primitive object={cloned} />
    </group>
  );
}

function ToolMesh({
  toolId,
  position,
  facingYaw,
}: {
  toolId: string;
  position: [number, number, number];
  facingYaw: number;
}) {
  if (toolId === "hand-edger") {
    return <HandEdgerSilhouette position={position} facingYaw={facingYaw} />;
  }
  if (toolId === "hand-weeder") {
    return <HandWeederSilhouette position={position} facingYaw={facingYaw} />;
  }
  const mount = KIT_MOUNT[toolId];
  if (!mount) return <FallbackToolMesh position={position} />;
  return (
    <CatalogToolMesh mount={mount} position={position} facingYaw={facingYaw} />
  );
}

/** Shared tool presentation — hitboxes stay separate. */
export function GardenToolView({
  toolId,
  position,
  facing = [0, 1],
}: {
  toolId: string | null | undefined;
  position: [number, number, number];
  facing?: [number, number];
}) {
  if (!toolId) return null;
  const yaw = Math.atan2(facing[0], facing[1]);
  return (
    <Suspense
      fallback={
        <mesh position={position}>
          <boxGeometry args={[0.3, 0.35, 0.12]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      }
    >
      <ToolMesh toolId={toolId} position={position} facingYaw={yaw} />
    </Suspense>
  );
}

Object.values(KIT_MOUNT).forEach((m) => {
  useGLTF.preload(MODEL_CATALOG[m.catalog].localPath);
});
