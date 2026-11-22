"use client";

import { useRef, useState } from "react";
import { evaluateToolIntent } from "@/game/interaction/evaluateToolIntent";
import { useHoverIntent } from "@/game/interaction/hoverIntentStore";
import { useGameStore } from "@/game/store/gameStore";
import { GardenToolView } from "./GardenToolView";

export function HedgeTaskStage({
  onDragChange,
}: {
  onDragChange?: (d: boolean) => void;
}) {
  const clusters = useGameStore((s) => s.work.garden?.hedgeClusters);
  const garden = useGameStore((s) => s.work.garden);
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const tool = useGameStore((s) =>
    s.work.selectedToolId ? s.work.tools[s.work.selectedToolId] : null,
  );
  const cutHedgeCluster = useGameStore((s) => s.cutHedgeCluster);
  const setHover = useHoverIntent((s) => s.setHover);
  const clearHover = useHoverIntent((s) => s.clearHover);
  const dragging = useRef(false);
  const hit = useRef<Set<string>>(new Set());
  const [cursor, setCursor] = useState<[number, number, number]>([6.4, 0.8, 1]);
  const [facing, setFacing] = useState<[number, number]>([0, 1]);

  if (!clusters) return null;
  const powered = selectedToolId === "hedge-trimmer";
  const radius = powered ? 1.1 : 0.55;

  const stroke = (x: number, z: number) => {
    if (!selectedToolId) return;
    setCursor([x, 0.55, z]);
    const list = Object.values(clusters);
    for (const c of list) {
      // One effective hit per cluster per stroke (P1-03) — no focus remount
      if (hit.current.has(c.id)) continue;
      if (c.cut && !powered) continue;
      const d2 = (c.x - x) ** 2 + (c.z - z) ** 2;
      if (d2 > radius * radius) continue;
      hit.current.add(c.id);
      const overcut = powered && c.cut;
      cutHedgeCluster(c.id, selectedToolId, overcut);
    }
  };

  return (
    <group>
      <mesh
        // Vertical-ish work strip along hedge face (XZ projection of face)
        rotation={[-Math.PI / 2, 0, 0]}
        position={[6.4, 0.02, 1]}
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
          const intent = evaluateToolIntent(
            selectedToolId,
            { kind: "hedge", x: e.point.x, z: e.point.z },
            { garden, tool },
          );
          if (intent.level === "risk" || intent.level === "unavailable") {
            setHover({ kind: "hedge", id: "hedge-near-hazard" }, intent);
          } else if (!dragging.current) {
            clearHover();
          }
          if (!dragging.current) return;
          e.stopPropagation();
          const prev = cursor;
          const dx = e.point.x - prev[0];
          const dz = e.point.z - prev[2];
          if (Math.hypot(dx, dz) > 0.04) setFacing([dx, dz]);
          stroke(e.point.x, e.point.z);
        }}
        onPointerUp={() => {
          dragging.current = false;
          onDragChange?.(false);
        }}
        onPointerCancel={() => {
          dragging.current = false;
          onDragChange?.(false);
        }}
        onPointerLeave={(e) => {
          clearHover();
          if (!dragging.current) return;
          if (!(e.target as HTMLElement).hasPointerCapture?.(e.pointerId)) {
            dragging.current = false;
            onDragChange?.(false);
          }
        }}
      >
        <planeGeometry args={[4.5, 12]} />
        <meshStandardMaterial color="#6a8a55" transparent opacity={0.2} />
      </mesh>
      <GardenToolView
        toolId={selectedToolId}
        position={cursor}
        facing={facing}
      />
    </group>
  );
}
