"use client";

import { Canvas } from "@react-three/fiber";
import { GardenOverviewScene } from "./GardenOverviewScene";
import { LAWN_TASK_CAMERA, OVERVIEW_CAMERA } from "@/data/gardenScene";

export function GardenCanvas({
  mode,
  onSelectLawn,
}: {
  mode: "overview" | "lawn-task";
  onSelectLawn: () => void;
}) {
  const cam = mode === "overview" ? OVERVIEW_CAMERA : LAWN_TASK_CAMERA;

  return (
    <div className="h-full min-h-[480px] w-full bg-sky-200">
      <Canvas
        shadows
        camera={{
          position: cam.position,
          fov: cam.fov,
          near: 0.1,
          far: 120,
        }}
        gl={{ antialias: true, toneMappingExposure: 1.05 }}
        dpr={[1, 1.75]}
      >
        <GardenOverviewScene mode={mode} onSelectLawn={onSelectLawn} />
      </Canvas>
    </div>
  );
}
