"use client";

import { useState } from "react";
import { Html } from "@react-three/drei";
import { GARDEN_TASKS } from "@/data/gardenTasks";
import { useGameStore } from "@/game/store/gameStore";
import { useLocale } from "@/i18n/LocaleProvider";

/**
 * Camera-only area markers (G01 / G14).
 * Never compete with work hit proxies: no large transparent pick boxes.
 * Labels sit offset so they cannot cover hazard/plant hit targets.
 */
export function GardenHotspots({
  onSelect,
}: {
  onSelect: (taskId: string) => void;
}) {
  const { t } = useLocale();
  const [hovered, setHovered] = useState<string | null>(null);
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const garden = useGameStore((s) => s.work.garden);
  const inspected = garden?.inspection ?? {};
  const setFocusPoint = useGameStore((s) => s.setFocusPoint);
  const setActiveGardenTask = useGameStore((s) => s.setActiveGardenTask);

  // Work tools selected → hide pickable markers so they cannot steal raycasts
  const workMode = selectedToolId != null;

  const focusArea = (taskId: string) => {
    const task = GARDEN_TASKS.find((x) => x.id === taskId);
    if (!task) return;
    setFocusPoint({ x: task.center[0], z: task.center[2] });
    setActiveGardenTask(task.id);
    onSelect(task.id);
  };

  return (
    <group>
      {GARDEN_TASKS.map((task) => {
        const known = task.discoverable || inspected[task.id]?.observed;
        const isHover = hovered === task.id;
        // Keep poles/labels off work targets so they cannot steal Hands hits (G01/G04)
        const poleOffset: [number, number, number] =
          task.id === "hazard"
            ? [1.15, 0, -0.85]
            : task.id === "flowerbed"
              ? [1.0, 0, -0.7]
              : [0, 0, 0];
        const labelOffset: [number, number, number] = [
          poleOffset[0],
          1.15,
          poleOffset[2],
        ];
        return (
          <group key={task.id} position={task.center}>
            {/* Tiny vertical marker — offset from hazard/plant hit proxies */}
            <mesh
              position={[poleOffset[0], 0.55, poleOffset[2]]}
              visible={!workMode}
              // Never raycast — HTML button is the only camera control (avoids stealing Hands)
              raycast={() => null}
            >
              <cylinderGeometry args={[0.08, 0.1, 0.9, 8]} />
              <meshBasicMaterial
                color={isHover ? "#c8e6a0" : known ? "#9ccc65" : "#90a4ae"}
                transparent
                opacity={workMode ? 0 : isHover ? 0.95 : 0.55}
                depthWrite={false}
              />
            </mesh>
            {!workMode ? (
              <Html distanceFactor={18} position={labelOffset} center>
                <button
                  type="button"
                  data-testid={`camera-marker-${task.id}`}
                  className={`pointer-events-auto max-w-[110px] cursor-pointer rounded px-1.5 py-0.5 text-left text-[10px] shadow sm:text-xs ${
                    isHover
                      ? "bg-[#f7f3ea]/95 text-stone-800"
                      : "bg-white/75 text-stone-700"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    focusArea(task.id);
                  }}
                  onPointerEnter={() => setHovered(task.id)}
                  onPointerLeave={() => setHovered(null)}
                >
                  <div className="font-medium leading-tight">{task.name}</div>
                  <div className="text-[9px] text-stone-500">
                    {t("garden.cameraOnly")}
                  </div>
                </button>
              </Html>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}
