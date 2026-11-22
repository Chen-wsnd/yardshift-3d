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
  const lastPoint = useRef<{ x: number; z: number } | null>(null);
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
    let direction: [number, number] = [1, 0];
    const prev = lastPoint.current;
    if (prev) {
      const dx = point.x - prev.x;
      const dz = point.z - prev.z;
      const len = Math.hypot(dx, dz);
      if (len > 0.02) direction = [dx / len, dz / len];
    }
    lastPoint.current = point;
    performWorkAction({
      zoneId: zone.id,
      toolId: selectedToolId,
      action: "cut",
      worldX: point.x,
      worldZ: point.z,
      strokeId: `${now}-${cellId ?? "ground"}`,
      direction,
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
                lastPoint.current = null;
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
