"use client";

import { useRef, useState } from "react";
import { useGameStore } from "@/game/store/gameStore";
import { GardenWorldOverlays } from "./GardenWorldOverlays";

export function HedgeTaskStage({
  onDragChange,
}: {
  onDragChange?: (d: boolean) => void;
}) {
  const clusters = useGameStore((s) => s.work.garden?.hedgeClusters);
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const cutHedgeCluster = useGameStore((s) => s.cutHedgeCluster);
  const dragging = useRef(false);
  const hit = useRef<Set<string>>(new Set());
  const [cursor, setCursor] = useState<[number, number, number]>([5.4, 0.8, 0]);

  if (!clusters) return null;
  const powered = selectedToolId === "hedge-trimmer";
  const radius = powered ? 1.1 : 0.55;

  const stroke = (x: number, z: number) => {
    if (!selectedToolId) return;
    setCursor([x, 0.8, z]);
    const list = Object.values(clusters);
    for (const c of list) {
      if (c.cut && !powered) continue;
      const d2 = (c.x - x) ** 2 + (c.z - z) ** 2;
      if (d2 > radius * radius) continue;
      if (hit.current.has(c.id) && !powered) continue;
      hit.current.add(c.id);
      // Powered sweep over already-cut cluster → overcut risk
      const overcut = powered && c.cut;
      cutHedgeCluster(c.id, selectedToolId, overcut);
    }
  };

  return (
    <group>
      <GardenWorldOverlays includeLawn={false} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[5.4, 0.02, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          dragging.current = true;
          hit.current = new Set();
          onDragChange?.(true);
          (
            e.target as unknown as { setPointerCapture?: (id: number) => void }
          ).setPointerCapture?.(e.pointerId);
          stroke(e.point.x, e.point.z);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          e.stopPropagation();
          stroke(e.point.x, e.point.z);
        }}
        onPointerUp={() => {
          dragging.current = false;
          onDragChange?.(false);
        }}
      >
        <planeGeometry args={[4, 10]} />
        <meshStandardMaterial color="#6a8a55" />
      </mesh>
      {/* Visible tool proxy */}
      <mesh position={cursor}>
        <boxGeometry args={powered ? [1.4, 0.2, 0.35] : [0.35, 0.55, 0.12]} />
        <meshStandardMaterial color={powered ? "#2a6db0" : "#888"} />
      </mesh>
    </group>
  );
}
