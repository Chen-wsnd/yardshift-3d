"use client";

import { useGameStore } from "@/game/store/gameStore";

export function FlowerbedTaskStage() {
  const plants = useGameStore((s) => s.work.garden?.plants);
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const pullWeed = useGameStore((s) => s.pullWeed);
  const topCutWeed = useGameStore((s) => s.topCutWeed);

  if (!plants) return null;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6.3, 0.02, 2.25]}>
        <planeGeometry args={[3.5, 4]} />
        <meshStandardMaterial color="#6b8f4a" transparent opacity={0.35} />
      </mesh>
      {Object.values(plants).map((p) => {
        if (p.rootRemoved) return null;
        return (
          <mesh
            key={p.id}
            position={[p.x, 0.3, p.z]}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedToolId === "hand-weeder") pullWeed(p.id);
              else if (selectedToolId === "string-trimmer") topCutWeed(p.id);
              else if (p.kind === "flower") pullWeed(p.id);
            }}
          >
            <sphereGeometry
              args={[p.kind === "flower" ? 0.18 : p.topCut ? 0.1 : 0.16, 8, 8]}
            />
            <meshStandardMaterial
              color={
                p.ornamentalDamage
                  ? "#4a3020"
                  : p.kind === "flower"
                    ? "#e07090"
                    : p.topCut
                      ? "#6b8f4a"
                      : "#3d6b2e"
              }
            />
          </mesh>
        );
      })}
    </group>
  );
}
