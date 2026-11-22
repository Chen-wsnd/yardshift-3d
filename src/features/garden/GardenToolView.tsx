"use client";

import { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { MODEL_CATALOG } from "@/features/yard/assets/modelCatalog";

const TOOL_MOUNT: Record<
  string,
  { catalog: keyof typeof MODEL_CATALOG; scale: number; y: number; yaw: number }
> = {
  "hand-hedge-shears": { catalog: "garden_shears", scale: 1.1, y: 0.15, yaw: 0 },
  "hedge-trimmer": { catalog: "hedge_trimmer", scale: 1.0, y: 0.1, yaw: Math.PI / 2 },
  rake: { catalog: "leaf_rake", scale: 1.0, y: 0.05, yaw: 0 },
  "leaf-blower": { catalog: "leaf_blower", scale: 1.0, y: 0.1, yaw: Math.PI },
  bag: { catalog: "grass_bag", scale: 1.0, y: 0.05, yaw: 0 },
  "string-trimmer": { catalog: "string_trimmer", scale: 1.0, y: 0.1, yaw: 0 },
  "hand-edger": { catalog: "string_trimmer", scale: 0.85, y: 0.05, yaw: 0 },
  "hand-weeder": { catalog: "garden_shears", scale: 0.7, y: 0.05, yaw: 0 },
};

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
  mount: (typeof TOOL_MOUNT)[string];
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
  const mount = TOOL_MOUNT[toolId];
  if (!mount) return <FallbackToolMesh position={position} />;
  return (
    <CatalogToolMesh mount={mount} position={position} facingYaw={facingYaw} />
  );
}

/** Shared CC0 kit tool presentation — hitboxes stay separate. */
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

Object.values(TOOL_MOUNT).forEach((m) => {
  useGLTF.preload(MODEL_CATALOG[m.catalog].localPath);
});
