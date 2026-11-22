"use client";

import { useRef, useState } from "react";
import { evaluateToolIntent } from "@/game/interaction/evaluateToolIntent";
import { useHoverIntent } from "@/game/interaction/hoverIntentStore";
import { useGameStore } from "@/game/store/gameStore";
import { GardenToolView } from "./GardenToolView";

/**
 * Yard-wide debris ops: work plane covers reachable ground; camera focus
 * follows garden.focusPoint (click a pile in overview or here).
 */
export function DebrisTaskStage({
  onDragChange,
}: {
  onDragChange?: (d: boolean) => void;
}) {
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const garden = useGameStore((s) => s.work.garden);
  const tool = useGameStore((s) =>
    s.work.selectedToolId ? s.work.tools[s.work.selectedToolId] : null,
  );
  const focus = useGameStore((s) => s.work.garden?.focusPoint);
  const rakeDebris = useGameStore((s) => s.rakeDebris);
  const blowDebris = useGameStore((s) => s.blowDebris);
  const bagNearbyPiles = useGameStore((s) => s.bagNearbyPiles);
  const setHover = useHoverIntent((s) => s.setHover);
  const clearHover = useHoverIntent((s) => s.clearHover);
  const dragging = useRef(false);
  const last = useRef<{ x: number; z: number } | null>(null);
  const cx = focus?.x ?? -3.0;
  const cz = focus?.z ?? -4.2;
  const [pos, setPos] = useState<[number, number, number]>([cx, 0.2, cz]);
  const [facing, setFacing] = useState<[number, number]>([0, 1]);

  const previewAt = (x: number, z: number) => {
    if (selectedToolId === "bag") {
      const nearby = Object.values(garden?.debris ?? {}).find(
        (d) =>
          d.state !== "bagged" &&
          (d.x - x) ** 2 + (d.z - z) ** 2 < 1.2 * 1.2,
      );
      const intent = evaluateToolIntent(
        selectedToolId,
        {
          kind: "debris",
          id: nearby?.id,
          x,
          z,
        },
        { garden, tool },
      );
      setHover({ kind: "debris", id: nearby?.id }, intent);
      return;
    }
    if (selectedToolId === "leaf-blower") {
      const nearby = Object.values(garden?.debris ?? {}).some(
        (d) =>
          d.state !== "bagged" &&
          (d.x - x) ** 2 + (d.z - z) ** 2 < 2.2 * 2.2,
      );
      if (!nearby) {
        const intent = evaluateToolIntent(
          selectedToolId,
          { kind: "ground", x, z },
          { garden, tool },
        );
        setHover({ kind: "ground" }, intent);
      } else {
        clearHover();
      }
    }
  };

  const endDrag = () => {
    dragging.current = false;
    last.current = null;
    onDragChange?.(false);
  };

  const onMove = (x: number, z: number) => {
    const prev = last.current;
    last.current = { x, z };
    setPos([x, 0.2, z]);
    if (!prev || !selectedToolId) return;
    const dx = x - prev.x;
    const dz = z - prev.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.08) return;
    setFacing([dx / len, dz / len]);
    if (selectedToolId === "rake") {
      rakeDebris(x, z, dx / len, dz / len);
    } else if (selectedToolId === "leaf-blower") {
      blowDebris(x, z, dx / len, dz / len);
    }
  };

  return (
    <group>
      {/* Large reachable ground — east hedge + SW path both covered */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[1.5, 0.02, -1.0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          // Do NOT setFocusPoint every pointerDown — remounts Canvas (P0-02)
          if (selectedToolId === "bag") {
            bagNearbyPiles(e.point.x, e.point.z);
            return;
          }
          dragging.current = true;
          last.current = { x: e.point.x, z: e.point.z };
          setPos([e.point.x, 0.2, e.point.z]);
          onDragChange?.(true);
          (
            e.target as unknown as { setPointerCapture?: (id: number) => void }
          ).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          previewAt(e.point.x, e.point.z);
          if (!dragging.current) return;
          e.stopPropagation();
          onMove(e.point.x, e.point.z);
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => {
          clearHover();
          if (dragging.current) endDrag();
        }}
      >
        {/* Sized for debris work — not a full-yard raycast steal (GATE-G) */}
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#7a9a5a" transparent opacity={0.08} />
      </mesh>
      <GardenToolView
        toolId={selectedToolId}
        position={pos}
        facing={facing}
      />
    </group>
  );
}
