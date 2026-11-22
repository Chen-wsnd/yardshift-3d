"use client";

import { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { MODEL_CATALOG } from "@/features/yard/assets/modelCatalog";
import { useGameStore } from "@/game/store/gameStore";
import { GardenToolView } from "./GardenToolView";

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

  if (!plants) return null;

  // All completion-counted plants are operable here (J12).
  const local = Object.values(plants).filter(
    (p) => !p.rootRemoved && p.countsTowardCompletion !== false,
  );

  const act = (id: string) => {
    if (selectedToolId === "hand-weeder") pullWeed(id);
    else if (selectedToolId === "string-trimmer") topCutWeed(id);
    else if (selectedToolId) {
      // Wrong tool — store still enforces; surface via lastEvents
      pullWeed(id);
    }
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
                onClick={() => act(p.id)}
              />
            );
          }
          return (
            <mesh
              key={p.id}
              position={[p.x, 0.25, p.z]}
              onClick={(e) => {
                e.stopPropagation();
                act(p.id);
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
