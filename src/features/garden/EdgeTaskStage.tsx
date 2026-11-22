"use client";

import { useRef } from "react";
import { useGameStore } from "@/game/store/gameStore";
import { LAWN_ZONE_ID } from "@/data/lawnGrid";
import { interpolateSamples } from "@/game/work/lawnSweep";
import { V03_GARDEN_JOB_ID } from "@/game/work/gardenFixtures";
import { LawnFootprintLayer } from "./LawnFootprintLayer";
import { GardenWorldOverlays } from "./GardenWorldOverlays";

/** Narrow edge strip along south lawn — uses same lawn cells near z max. */
export function EdgeTaskStage({
  onDragChange,
}: {
  onDragChange?: (d: boolean) => void;
}) {
  const job = useGameStore((s) => s.work.jobs[V03_GARDEN_JOB_ID]);
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const performWorkAction = useGameStore((s) => s.performWorkAction);
  const zone = job?.zones.find((z) => z.id === LAWN_ZONE_ID);
  const dragging = useRef(false);
  const last = useRef<{ x: number; z: number } | null>(null);

  if (!zone) return null;

  return (
    <group>
      <GardenWorldOverlays includeLawn={false} />
      <LawnFootprintLayer cells={zone.cells} />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 3.6]}
        onPointerDown={(e) => {
          e.stopPropagation();
          dragging.current = true;
          last.current = { x: e.point.x, z: e.point.z };
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
          if (!prev) return;
          // Only allow work near the south edge band
          if (e.point.z < 2.5) return;
          const samples = interpolateSamples(prev, e.point, 0.4);
          performWorkAction({
            jobId: V03_GARDEN_JOB_ID,
            zoneId: LAWN_ZONE_ID,
            toolId: selectedToolId,
            action: "cut",
            worldX: e.point.x,
            worldZ: e.point.z,
            strokeId: `edge-${performance.now()}`,
            direction: [1, 0],
            forwardMotion: true,
            sweepSamples: samples,
          });
        }}
        onPointerUp={() => {
          dragging.current = false;
          last.current = null;
          onDragChange?.(false);
        }}
      >
        <planeGeometry args={[10, 2.2]} />
        <meshBasicMaterial transparent opacity={0.15} color="#cde" />
      </mesh>
    </group>
  );
}
