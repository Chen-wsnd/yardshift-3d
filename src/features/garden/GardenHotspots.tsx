"use client";

import { useState } from "react";
import { GARDEN_TASKS } from "@/data/gardenTasks";
import { useGameStore } from "@/game/store/gameStore";

export function GardenHotspots({
  onSelect,
}: {
  onSelect: (taskId: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const garden = useGameStore((s) => s.work.garden);
  const inspected = garden?.inspection ?? {};

  return (
    <group>
      {GARDEN_TASKS.map((task) => {
        const known = task.discoverable || inspected[task.id]?.observed;
        const opacity = hovered === task.id ? 0.22 : known ? 0.08 : 0.03;
        return (
          <mesh
            key={task.id}
            position={task.center}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(task.id);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHovered(null);
              document.body.style.cursor = "auto";
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(task.id);
            }}
          >
            <boxGeometry args={task.size} />
            <meshBasicMaterial
              color={hovered === task.id ? "#c8e6a0" : "#9ccc65"}
              transparent
              opacity={opacity}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
