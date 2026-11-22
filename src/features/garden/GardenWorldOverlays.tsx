"use client";

import { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "@/game/store/gameStore";
import { MODEL_CATALOG } from "@/features/yard/assets/modelCatalog";
import { LawnOverviewOverlay } from "./LawnOverviewOverlay";

function HedgeOverlays() {
  const clusters = useGameStore((s) => s.work.garden?.hedgeClusters);
  const { scene } = useGLTF(MODEL_CATALOG.hedge_block.localPath);
  const proto = useMemo(() => scene.clone(true), [scene]);
  if (!clusters) return null;
  return (
    <group>
      {Object.values(clusters).map((c) => (
        <group
          key={c.id}
          position={[c.x, 0, c.z]}
          scale={
            c.cut
              ? [0.55, c.overcut ? 0.35 : 0.55, 0.55]
              : [0.75, 0.85, 0.75]
          }
        >
          <primitive object={proto.clone(true)} />
        </group>
      ))}
    </group>
  );
}

function DebrisOverlays() {
  const debris = useGameStore((s) => s.work.garden?.debris);
  const setFocusPoint = useGameStore((s) => s.setFocusPoint);
  const setActiveGardenTask = useGameStore((s) => s.setActiveGardenTask);
  if (!debris) return null;
  return (
    <group>
      {Object.values(debris)
        .filter((d) => d.state !== "bagged")
        .map((d) => (
          <mesh
            key={d.id}
            position={[d.x, d.state === "gathered" ? 0.08 : 0.03, d.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              setFocusPoint({ x: d.x, z: d.z });
              setActiveGardenTask("debris");
            }}
          >
            <circleGeometry
              args={[d.state === "gathered" ? 0.38 : 0.16, 10]}
            />
            <meshStandardMaterial
              color={d.kind === "clipping" ? "#5a7a3a" : "#c4a35a"}
              transparent
              opacity={0.92}
            />
          </mesh>
        ))}
    </group>
  );
}

function HazardOverlays() {
  const hazards = useGameStore((s) => s.work.garden?.hazards);
  if (!hazards) return null;
  return (
    <group>
      {Object.values(hazards)
        .filter((h) => !h.cleared)
        .map((h) => (
          <mesh key={h.id} position={[h.x, 0.12, h.z]}>
            <dodecahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial color="#7a7a7a" />
          </mesh>
        ))}
    </group>
  );
}

function PlantOverlays() {
  const plants = useGameStore((s) => s.work.garden?.plants);
  const { scene } = useGLTF(MODEL_CATALOG.dandelion.localPath);
  const weedProto = useMemo(() => scene.clone(true), [scene]);
  if (!plants) return null;
  return (
    <group>
      {Object.values(plants).map((p) => {
        if (p.rootRemoved) return null;
        if (p.kind === "weed") {
          return (
            <group
              key={p.id}
              position={[p.x, 0, p.z]}
              scale={p.topCut ? 0.45 : 0.85}
            >
              <primitive object={weedProto.clone(true)} />
            </group>
          );
        }
        // Simple flower silhouette — distinct from weed GLB (G09)
        const bloom = p.ornamentalDamage ? "#4a3020" : "#e07090";
        return (
          <group key={p.id} position={[p.x, 0, p.z]}>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.02, 0.025, 0.24, 6]} />
              <meshStandardMaterial color="#3d6b2e" />
            </mesh>
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh
                key={i}
                position={[
                  Math.cos((i / 5) * Math.PI * 2) * 0.08,
                  0.28,
                  Math.sin((i / 5) * Math.PI * 2) * 0.08,
                ]}
              >
                <sphereGeometry args={[0.05, 6, 6]} />
                <meshStandardMaterial color={bloom} />
              </mesh>
            ))}
            <mesh position={[0, 0.28, 0]}>
              <sphereGeometry args={[0.035, 6, 6]} />
              <meshStandardMaterial color={p.ornamentalDamage ? "#2a1810" : "#f5d76e"} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Shared world projections for overview + consistency with task stages. */
export function GardenWorldOverlays({ includeLawn = true }: { includeLawn?: boolean }) {
  return (
    <group>
      {includeLawn ? <LawnOverviewOverlay /> : null}
      <Suspense fallback={null}>
        <HedgeOverlays />
        <PlantOverlays />
      </Suspense>
      <DebrisOverlays />
      <HazardOverlays />
    </group>
  );
}

useGLTF.preload(MODEL_CATALOG.dandelion.localPath);
useGLTF.preload(MODEL_CATALOG.hedge_block.localPath);
