"use client";

import { useRef, useState } from "react";
import { WorkCellVisual } from "@/features/yard/visuals/WorkCellVisuals";
import { useGameStore } from "@/game/store/gameStore";
import { V03_GARDEN_JOB_ID } from "@/game/work/gardenFixtures";
import { MowerTool } from "./MowerTool";

/**
 * Full-viewport lawn mowing: drag moves a visible mower; cut trails follow
 * actual pointer displacement (not a constant direction).
 */
export function LawnTaskStage() {
  const job = useGameStore((s) => s.work.jobs[V03_GARDEN_JOB_ID]);
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const performWorkAction = useGameStore((s) => s.performWorkAction);
  const zone = job?.zones.find((z) => z.id === "j1-lawn");

  const dragging = useRef(false);
  const lastStrokeAt = useRef(0);
  const lastPoint = useRef<{ x: number; z: number } | null>(null);
  const [mowerPos, setMowerPos] = useState<[number, number, number]>([0, 0, 0]);
  const [dir, setDir] = useState<[number, number]>([0, 1]);

  if (!zone) return null;

  const powered = selectedToolId === "lawn-mower";

  const stroke = (point: { x: number; z: number }) => {
    if (!selectedToolId) return;
    const now = performance.now();
    const prev = lastPoint.current;
    let direction: [number, number] = dir;
    if (prev) {
      const dx = point.x - prev.x;
      const dz = point.z - prev.z;
      const len = Math.hypot(dx, dz);
      if (len > 0.02) {
        direction = [dx / len, dz / len];
        setDir(direction);
      }
    }
    lastPoint.current = point;
    setMowerPos([point.x, 0, point.z]);

    // Throttle by distance-ish time so one click cannot clear the field
    if (now - lastStrokeAt.current < (powered ? 55 : 90)) return;
    lastStrokeAt.current = now;

    performWorkAction({
      jobId: V03_GARDEN_JOB_ID,
      zoneId: zone.id,
      toolId: selectedToolId,
      action: "cut",
      worldX: point.x,
      worldZ: point.z,
      strokeId: `lawn-${now}`,
      direction,
    });
  };

  return (
    <group>
      {/* Soft ground plane for continuous dragging */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          dragging.current = true;
          (
            e.target as unknown as { setPointerCapture?: (id: number) => void }
          ).setPointerCapture?.(e.pointerId);
          stroke(e.point);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          e.stopPropagation();
          stroke(e.point);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          dragging.current = false;
          lastPoint.current = null;
        }}
      >
        <planeGeometry args={[14, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {zone.cells.map((cell) => (
        <WorkCellVisual
          key={cell.id}
          cell={cell}
          kind="lawn"
          useModels
        />
      ))}

      {/* Flower border markers */}
      {zone.cells
        .filter((c) => c.protectedKind === "flower")
        .map((c) => (
          <mesh
            key={`flower-${c.id}`}
            position={[c.localX + 0.35, 0.28, c.localZ]}
          >
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial
              color={
                c.damageKinds.includes("flower_damaged") ||
                c.result === "flower_damaged"
                  ? "#553322"
                  : "#e07090"
              }
            />
          </mesh>
        ))}

      <MowerTool position={mowerPos} direction={dir} powered={powered} />
    </group>
  );
}
