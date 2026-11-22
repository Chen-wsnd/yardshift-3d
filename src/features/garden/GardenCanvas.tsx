"use client";

import { Canvas } from "@react-three/fiber";
import { getGardenTask } from "@/data/gardenTasks";
import { OVERVIEW_CAMERA } from "@/data/gardenScene";
import { useGameStore } from "@/game/store/gameStore";
import { GardenOverviewScene } from "./GardenOverviewScene";

export function GardenCanvas({
  activeTaskId,
  onSelectTask,
}: {
  activeTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}) {
  const task = activeTaskId ? getGardenTask(activeTaskId) : null;
  const focus = useGameStore((s) => s.work.garden?.focusPoint);
  let cam = task?.camera ?? {
    position: OVERVIEW_CAMERA.position,
    target: OVERVIEW_CAMERA.target,
  };
  // Debris / hedge follow-up: aim camera at live focus (east clippings etc.)
  if (activeTaskId === "debris" && focus) {
    cam = {
      position: [focus.x + 3, 7, focus.z + 4],
      target: [focus.x, 0, focus.z],
    };
  }

  return (
    <div className="absolute inset-0 h-full w-full bg-sky-200">
      <Canvas
        key={`${activeTaskId ?? "overview"}-${focus ? `${focus.x.toFixed(1)}:${focus.z.toFixed(1)}` : "nofocus"}`}
        shadows
        camera={{
          position: cam.position,
          fov: activeTaskId ? 42 : OVERVIEW_CAMERA.fov,
          near: 0.1,
          far: 120,
        }}
        gl={{ antialias: true, toneMappingExposure: 1.05 }}
        dpr={[1, 1.75]}
      >
        <GardenOverviewScene
          activeTaskId={activeTaskId}
          onSelectTask={onSelectTask}
        />
      </Canvas>
    </div>
  );
}
