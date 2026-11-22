"use client";

import { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { FLOWERBED_PLACEMENT } from "@/data/gardenPlacement";
import { MODEL_CATALOG } from "@/features/yard/assets/modelCatalog";
import { useGameStore } from "@/game/store/gameStore";
import { GardenToolView } from "./GardenToolView";

function inFlowerbed(x: number, z: number) {
  const c = FLOWERBED_PLACEMENT.hotspotCenter;
  const s = FLOWERBED_PLACEMENT.hotspotSize;
  return Math.abs(x - c[0]) <= s[0] * 0.65 && Math.abs(z - c[2]) <= s[2] * 0.65;
}

function WeedMesh({
  x,
  z,
  topCut,
  onClick,
}: {
  x: number;
  z: number;
  topCut: boolean;
  onClick: () => void;
}) {
  const { scene } = useGLTF(MODEL_CATALOG.dandelion.localPath);
  const proto = useMemo(() => scene.clone(true), [scene]);
  return (
    <group
      position={[x, 0, z]}
      scale={topCut ? 0.4 : 0.9}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <primitive object={proto.clone(true)} />
      <mesh visible={false}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}

export function FlowerbedTaskStage() {
  const plants = useGameStore((s) => s.work.garden?.plants);
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const pullWeed = useGameStore((s) => s.pullWeed);
  const topCutWeed = useGameStore((s) => s.topCutWeed);
  const toolResource = useGameStore((s) =>
    s.work.selectedToolId
      ? s.work.tools[s.work.selectedToolId]?.resource
      : 100,
  );
  const toolStatus = useGameStore((s) =>
    s.work.selectedToolId
      ? s.work.tools[s.work.selectedToolId]?.status
      : "ready",
  );

  if (!plants) return null;

  const local = Object.values(plants).filter(
    (p) => !p.rootRemoved && inFlowerbed(p.x, p.z),
  );

  const act = (id: string, kind: "weed" | "flower") => {
    if (
      selectedToolId === "string-trimmer" &&
      (toolStatus === "unpowered" || (toolResource ?? 0) <= 0)
    ) {
      return;
    }
    if (selectedToolId === "hand-weeder") pullWeed(id);
    else if (selectedToolId === "string-trimmer") topCutWeed(id);
    else if (kind === "flower") pullWeed(id);
  };

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6.3, 0.02, 2.25]}>
        <planeGeometry args={[3.5, 4]} />
        <meshStandardMaterial color="#6b8f4a" transparent opacity={0.3} />
      </mesh>
      <Suspense fallback={null}>
        {local.map((p) => {
          if (p.kind === "weed") {
            return (
              <WeedMesh
                key={p.id}
                x={p.x}
                z={p.z}
                topCut={p.topCut}
                onClick={() => act(p.id, "weed")}
              />
            );
          }
          return (
            <mesh
              key={p.id}
              position={[p.x, 0.25, p.z]}
              onClick={(e) => {
                e.stopPropagation();
                act(p.id, "flower");
              }}
            >
              <sphereGeometry args={[0.16, 8, 8]} />
              <meshStandardMaterial
                color={p.ornamentalDamage ? "#4a3020" : "#e07090"}
              />
            </mesh>
          );
        })}
      </Suspense>
      <GardenToolView
        toolId={selectedToolId}
        position={[-6.3, 0.35, 2.25]}
      />
    </group>
  );
}

useGLTF.preload(MODEL_CATALOG.dandelion.localPath);
