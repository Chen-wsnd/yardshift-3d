"use client";

import { useRef, useState } from "react";
import { useGameStore } from "@/game/store/gameStore";
import { interpolateSamples } from "@/game/work/lawnSweep";
import { GardenToolView } from "./GardenToolView";

/** Independent edge strip — does not write lawn WorkCells. */
export function EdgeTaskStage({
  onDragChange,
}: {
  onDragChange?: (d: boolean) => void;
}) {
  const segments = useGameStore((s) => s.work.garden?.edgeSegments);
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const applyEdgeWork = useGameStore((s) => s.applyEdgeWork);
  const dragging = useRef(false);
  const last = useRef<{ x: number; z: number } | null>(null);
  const [pos, setPos] = useState<[number, number, number]>([0, 0.2, -3.6]);
  const [facing, setFacing] = useState<[number, number]>([1, 0]);

  if (!segments) return null;

  return (
    <group>
      {Object.values(segments).map((seg) => (
        <mesh key={seg.id} position={[seg.x, 0.08, seg.z]}>
          <boxGeometry args={[0.7, seg.finished ? 0.04 : 0.18, 0.35]} />
          <meshStandardMaterial
            color={seg.finished ? "#6a9a4e" : "#3d5a2e"}
          />
        </mesh>
      ))}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, -3.6]}
        onPointerDown={(e) => {
          e.stopPropagation();
          dragging.current = true;
          last.current = { x: e.point.x, z: e.point.z };
          setPos([e.point.x, 0.2, e.point.z]);
          onDragChange?.(true);
          (
            e.target as unknown as { setPointerCapture?: (id: number) => void }
          ).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging.current || !selectedToolId) return;
          e.stopPropagation();
          const prev = last.current;
          last.current = { x: e.point.x, z: e.point.z };
          setPos([e.point.x, 0.2, e.point.z]);
          if (!prev) return;
          const dx = e.point.x - prev.x;
          const dz = e.point.z - prev.z;
          if (Math.hypot(dx, dz) > 0.05) setFacing([dx, dz]);
          if (e.point.z > -2.6 || e.point.z < -4.2) return;
          const samples = interpolateSamples(prev, e.point, 0.35);
          applyEdgeWork(e.point.x, e.point.z, samples);
        }}
        onPointerUp={() => {
          dragging.current = false;
          last.current = null;
          onDragChange?.(false);
        }}
      >
        <planeGeometry args={[10, 2.2]} />
        <meshBasicMaterial transparent opacity={0.12} color="#cde" />
      </mesh>
      <GardenToolView
        toolId={selectedToolId}
        position={pos}
        facing={facing}
      />
    </group>
  );
}
