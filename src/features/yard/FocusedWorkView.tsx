"use client";

import { useRef } from "react";
import { useGameStore } from "@/game/store/gameStore";
import { WorkCellVisual } from "./visuals/WorkCellVisuals";

/**
 * Focused zone work: left press+drag strokes with distance throttle.
 * Hitboxes are separate from decorative cell meshes.
 */
export function FocusedWorkView() {
  const jobId = useGameStore((s) => s.work.activeJobId);
  const zoneId = useGameStore((s) => s.work.focusedZoneId);
  const job = useGameStore((s) => (jobId ? s.work.jobs[jobId] : null));
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const performWorkAction = useGameStore((s) => s.performWorkAction);
  const zone = job?.zones.find((z) => z.id === zoneId);

  const lastStrokeAt = useRef(0);
  const lastCell = useRef<string | null>(null);
  const dragging = useRef(false);

  if (!zone || !jobId) return null;

  const stroke = (
    e: { point: { x: number; z: number }; stopPropagation: () => void },
    cellId?: string,
  ) => {
    if (!selectedToolId) return;
    const now = performance.now();
    if (now - lastStrokeAt.current < 90 && cellId === lastCell.current) return;
    lastStrokeAt.current = now;
    lastCell.current = cellId ?? null;
    const point = e.point;
    performWorkAction({
      zoneId: zone.id,
      toolId: selectedToolId,
      action: "cut",
      worldX: point.x,
      worldZ: point.z,
      strokeId: `${now}-${cellId ?? "ground"}`,
      direction: dragging.current ? [1, 0] : [1, 0],
    });
  };

  return (
    <group>
      {zone.cells.map((cell) => (
        <group key={cell.id}>
          <WorkCellVisual cell={cell} kind={zone.kind} useModels />
          {!cell.isPile ? (
            <mesh
              position={[cell.localX, 0.35, cell.localZ]}
              onPointerDown={(e) => {
                e.stopPropagation();
                dragging.current = true;
                (e.target as unknown as { setPointerCapture?: (id: number) => void }).setPointerCapture?.(
                  e.pointerId,
                );
                stroke(e, cell.id);
              }}
              onPointerMove={(e) => {
                if (!dragging.current) return;
                e.stopPropagation();
                stroke(e, cell.id);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                dragging.current = false;
              }}
            >
              <boxGeometry args={[1.5, 0.9, 1.5]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          ) : (
            <mesh
              position={[cell.localX, 0.4, cell.localZ]}
              onPointerDown={(e) => {
                e.stopPropagation();
                stroke(e, cell.id);
              }}
            >
              <sphereGeometry args={[0.7, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
