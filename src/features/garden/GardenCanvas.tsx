"use client";

import { Canvas } from "@react-three/fiber";
import { getGardenTask } from "@/data/gardenTasks";
import { OVERVIEW_CAMERA } from "@/data/gardenScene";
import { GardenOverviewScene } from "./GardenOverviewScene";

export function GardenCanvas({
  activeTaskId,
  onSelectTask,
}: {
  activeTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}) {
  const task = activeTaskId ? getGardenTask(activeTaskId) : null;
  const cam = task?.camera ?? {
    position: OVERVIEW_CAMERA.position,
    target: OVERVIEW_CAMERA.target,
  };

  return (
    <div className="absolute inset-0 h-full w-full bg-sky-200">
      <Canvas
        key={activeTaskId ?? "overview"}
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
