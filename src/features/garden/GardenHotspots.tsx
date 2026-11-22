"use client";

import { useState } from "react";
import { Html } from "@react-three/drei";
import { GARDEN_TASKS } from "@/data/gardenTasks";
import { useGameStore } from "@/game/store/gameStore";
import { useLocale } from "@/i18n/LocaleProvider";

/**
 * Optional camera guide markers — NOT a tool-permission gate (GATE-G).
 * Clicking only focuses the camera on that area.
 */
export function GardenHotspots({
  onSelect,
}: {
  onSelect: (taskId: string) => void;
}) {
  const { t } = useLocale();
  const [hovered, setHovered] = useState<string | null>(null);
  const garden = useGameStore((s) => s.work.garden);
  const inspected = garden?.inspection ?? {};
  const setFocusPoint = useGameStore((s) => s.setFocusPoint);
  const setActiveGardenTask = useGameStore((s) => s.setActiveGardenTask);

  return (
    <group>
      {GARDEN_TASKS.map((task) => {
        const known = task.discoverable || inspected[task.id]?.observed;
        const opacity = hovered === task.id ? 0.18 : known ? 0.06 : 0.03;
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
              setFocusPoint({ x: task.center[0], z: task.center[2] });
              // Camera guide only — does not open WorkConfirm or grant tools
              setActiveGardenTask(task.id);
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
            <Html distanceFactor={18} position={[0, 0.45, 0]} center>
              <button
                type="button"
                className={`pointer-events-auto max-w-[120px] cursor-pointer rounded px-1.5 py-0.5 text-left text-[10px] shadow sm:text-xs ${
                  hovered === task.id
                    ? "bg-[#f7f3ea]/95 text-stone-800"
                    : "bg-white/70 text-stone-700"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setFocusPoint({ x: task.center[0], z: task.center[2] });
                  setActiveGardenTask(task.id);
                  onSelect(task.id);
                }}
                onPointerEnter={() => setHovered(task.id)}
                onPointerLeave={() => setHovered(null)}
              >
                <div className="font-medium leading-tight">{task.name}</div>
                {hovered === task.id ? (
                  <div className="text-[9px] text-stone-500">
                    {t("garden.focusArea")}
                  </div>
                ) : null}
              </button>
            </Html>
          </mesh>
        );
      })}
    </group>
  );
}
