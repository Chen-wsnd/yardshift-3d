"use client";

import { useRef, useState } from "react";
import { useGameStore } from "@/game/store/gameStore";

export function DebrisTaskStage({
  onDragChange,
}: {
  onDragChange?: (d: boolean) => void;
}) {
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const rakeDebris = useGameStore((s) => s.rakeDebris);
  const blowDebris = useGameStore((s) => s.blowDebris);
  const bagNearbyPiles = useGameStore((s) => s.bagNearbyPiles);
  const dragging = useRef(false);
  const last = useRef<{ x: number; z: number } | null>(null);
  const [pos, setPos] = useState<[number, number, number]>([-3.0, 0.2, -4.2]);

  const onMove = (x: number, z: number) => {
    const prev = last.current;
    last.current = { x, z };
    setPos([x, 0.2, z]);
    if (!prev || !selectedToolId) return;
    const dx = x - prev.x;
    const dz = z - prev.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.08) return;
    if (selectedToolId === "rake") {
      rakeDebris(x, z, dx / len, dz / len);
    } else if (selectedToolId === "leaf-blower") {
      blowDebris(x, z, dx / len, dz / len);
    }
  };

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-3.2, 0.02, -4.0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (selectedToolId === "bag") {
            bagNearbyPiles(e.point.x, e.point.z);
            return;
          }
          dragging.current = true;
          last.current = { x: e.point.x, z: e.point.z };
          onDragChange?.(true);
          (
            e.target as unknown as { setPointerCapture?: (id: number) => void }
          ).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          e.stopPropagation();
          onMove(e.point.x, e.point.z);
        }}
        onPointerUp={() => {
          dragging.current = false;
          last.current = null;
          onDragChange?.(false);
        }}
      >
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#7a9a5a" transparent opacity={0.3} />
      </mesh>
      <mesh position={pos}>
        <cylinderGeometry args={[0.08, 0.12, 0.9, 6]} />
        <meshStandardMaterial
          color={
            selectedToolId === "leaf-blower"
              ? "#2a6db0"
              : selectedToolId === "bag"
                ? "#8a6a3a"
                : "#6a5"
          }
        />
      </mesh>
    </group>
  );
}
