"use client";

import { Suspense, useMemo, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { MODEL_CATALOG } from "@/features/yard/assets/modelCatalog";
import { evaluateToolIntent } from "@/game/interaction/evaluateToolIntent";
import { useHoverIntent } from "@/game/interaction/hoverIntentStore";
import { useGameStore } from "@/game/store/gameStore";
import { GardenToolView } from "./GardenToolView";

/** Opaque-to-raycast hit proxy — never visible={false} (G02). */
function HitProxy({
  radius,
  y,
  active,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  radius: number;
  y: number;
  active: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}) {
  return (
    <mesh
      position={[0, y, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        onPointerOver();
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
        onPointerOut();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <sphereGeometry args={[radius, 12, 12]} />
      <meshBasicMaterial
        transparent
        opacity={active ? 0.22 : 0.01}
        depthWrite={false}
        color={active ? "#e8f5c8" : "#ffffff"}
      />
    </mesh>
  );
}

function WeedMesh({
  id,
  x,
  z,
  topCut,
  selected,
  onHover,
  onLeave,
  onAct,
}: {
  id: string;
  x: number;
  z: number;
  topCut: boolean;
  selected: boolean;
  onHover: () => void;
  onLeave: () => void;
  onAct: () => void;
}) {
  const { scene } = useGLTF(MODEL_CATALOG.dandelion.localPath);
  const proto = useMemo(() => scene.clone(true), [scene]);
  return (
    <group position={[x, 0, z]}>
      {/* Visual scale only — hit proxy stays full size after top-cut */}
      <group scale={topCut ? 0.4 : 0.9} raycast={() => null}>
        <primitive object={proto.clone(true)} />
        {topCut ? (
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.08, 6]} />
            <meshStandardMaterial color="#5a4030" />
          </mesh>
        ) : null}
      </group>
      <HitProxy
        radius={0.32}
        y={0.28}
        active={selected}
        onPointerOver={onHover}
        onPointerOut={onLeave}
        onClick={onAct}
      />
      <mesh visible={false} userData={{ plantId: id, kind: "weed" }} />
    </group>
  );
}

export function FlowerbedTaskStage() {
  const plants = useGameStore((s) => s.work.garden?.plants);
  const garden = useGameStore((s) => s.work.garden);
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const tool = useGameStore((s) =>
    s.work.selectedToolId ? s.work.tools[s.work.selectedToolId] : null,
  );
  const pullWeed = useGameStore((s) => s.pullWeed);
  const topCutWeed = useGameStore((s) => s.topCutWeed);
  const damageFlower = useGameStore((s) => s.damageFlower);
  const setHover = useHoverIntent((s) => s.setHover);
  const clearHover = useHoverIntent((s) => s.clearHover);
  const [hoverId, setHoverId] = useState<string | null>(null);

  if (!plants) return null;

  const local = Object.values(plants).filter(
    (p) => !p.rootRemoved && p.countsTowardCompletion !== false,
  );

  const publishHover = (kind: "weed" | "flower", id: string) => {
    setHoverId(id);
    const intent = evaluateToolIntent(
      selectedToolId,
      { kind, id },
      { garden, tool },
    );
    setHover({ kind, id }, intent);
  };

  const act = (id: string, kind: "weed" | "flower") => {
    if (selectedToolId === "hand-weeder") {
      if (kind === "flower") damageFlower(id);
      else pullWeed(id);
      return;
    }
    if (selectedToolId === "string-trimmer") {
      if (kind === "flower") damageFlower(id);
      else topCutWeed(id);
      return;
    }
    if (selectedToolId) {
      // Wrong tool still goes through store for teaching feedback
      if (kind === "flower") damageFlower(id);
      else pullWeed(id);
    }
  };

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-6.3, 0.02, 2.25]}
        raycast={() => null}
      >
        <planeGeometry args={[3.5, 4]} />
        <meshStandardMaterial color="#6b8f4a" transparent opacity={0.3} />
      </mesh>
      <Suspense fallback={null}>
        {local.map((p) => {
          if (p.kind === "weed") {
            return (
              <WeedMesh
                key={p.id}
                id={p.id}
                x={p.x}
                z={p.z}
                topCut={p.topCut}
                selected={hoverId === p.id}
                onHover={() => publishHover("weed", p.id)}
                onLeave={() => {
                  setHoverId(null);
                  clearHover();
                }}
                onAct={() => act(p.id, "weed")}
              />
            );
          }
          const bloom = p.ornamentalDamage ? "#4a3020" : "#e07090";
          return (
            <group key={p.id} position={[p.x, 0, p.z]}>
              <group raycast={() => null}>
                <mesh position={[0, 0.12, 0]}>
                  <cylinderGeometry args={[0.02, 0.025, 0.24, 6]} />
                  <meshStandardMaterial color="#3d6b2e" />
                </mesh>
                {[0, 1, 2, 3, 4].map((i) => (
                  <mesh
                    key={i}
                    position={[
                      Math.cos((i / 5) * Math.PI * 2) * 0.09,
                      0.3,
                      Math.sin((i / 5) * Math.PI * 2) * 0.09,
                    ]}
                  >
                    <sphereGeometry args={[0.055, 6, 6]} />
                    <meshStandardMaterial color={bloom} />
                  </mesh>
                ))}
                <mesh position={[0, 0.3, 0]}>
                  <sphereGeometry args={[0.04, 6, 6]} />
                  <meshStandardMaterial
                    color={p.ornamentalDamage ? "#2a1810" : "#f5d76e"}
                  />
                </mesh>
              </group>
              <HitProxy
                radius={0.3}
                y={0.28}
                active={hoverId === p.id}
                onPointerOver={() => publishHover("flower", p.id)}
                onPointerOut={() => {
                  setHoverId(null);
                  clearHover();
                }}
                onClick={() => act(p.id, "flower")}
              />
            </group>
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
