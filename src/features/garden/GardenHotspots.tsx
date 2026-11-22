"use client";

import { useState } from "react";
import { Html } from "@react-three/drei";
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
  const setFocusPoint = useGameStore((s) => s.setFocusPoint);

  return (
    <group>
      {GARDEN_TASKS.map((task) => {
        const known = task.discoverable || inspected[task.id]?.observed;
        const opacity = hovered === task.id ? 0.28 : known ? 0.1 : 0.04;
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
              if (task.id === "debris") {
                setFocusPoint({ x: task.center[0], z: task.center[2] });
              }
              onSelect(task.id);
            }}
          >
            <boxGeometry args={task.size} />
            <meshBasicMaterial
              color={hovered === task.id ? "#c8e6a0" : known ? "#9ccc65" : "#b0bec5"}
              transparent
              opacity={opacity}
              depthWrite={false}
            />
            {hovered === task.id ? (
              <Html distanceFactor={18} position={[0, 0.4, 0]} center>
                <div className="rounded bg-[#f7f3ea]/95 px-2 py-1 text-xs text-stone-800 shadow">
                  <div className="font-medium">{task.name}</div>
                  <div className="text-[10px] text-stone-500">
                    {known ? task.designPurpose.slice(0, 72) : "Unconfirmed area — explore"}
                    {known ? "" : "…"}
                  </div>
                </div>
              </Html>
            ) : null}
          </mesh>
        );
      })}
    </group>
  );
}
