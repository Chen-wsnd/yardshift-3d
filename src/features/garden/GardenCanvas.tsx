"use client";

import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { getGardenTask } from "@/data/gardenTasks";
import { OVERVIEW_CAMERA } from "@/data/gardenScene";
import { useGameStore } from "@/game/store/gameStore";
import { GardenOverviewScene } from "./GardenOverviewScene";

/**
 * Stable Canvas forever — never keyed by tool or focus (GATE-G / P0-02).
 * Optional focusAreaId only aims the camera.
 */
function CameraAim() {
  const { camera } = useThree();
  const focus = useGameStore((s) => s.work.garden?.focusPoint);
  const focusAreaId = useGameStore((s) => s.work.garden?.activeTaskId);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const applied = useRef<string>("");

  useEffect(() => {
    const key = `${focusAreaId ?? ""}|${focus?.x ?? ""}|${focus?.z ?? ""}`;
    if (key === applied.current) return;
    // Skip empty initial
    if (!focus && !focusAreaId) return;
    applied.current = key;

    let target: [number, number, number];
    let position: [number, number, number];
    const task = focusAreaId ? getGardenTask(focusAreaId) : null;
    if (focus) {
      target = [focus.x, 0, focus.z];
      position = [focus.x + 4, 8, focus.z + 5];
    } else if (task) {
      target = task.camera.target;
      position = task.camera.position;
    } else {
      target = OVERVIEW_CAMERA.target as [number, number, number];
      position = OVERVIEW_CAMERA.position as [number, number, number];
    }
    camera.position.set(position[0], position[1], position[2]);
    if (controls && "target" in controls) {
      controls.target.set(target[0], target[1], target[2]);
      controls.update?.();
    }
    camera.lookAt(target[0], target[1], target[2]);
  }, [focus, focusAreaId, camera, controls]);

  return null;
}

export function GardenCanvas({
  onFocusArea,
}: {
  onFocusArea?: (areaId: string) => void;
}) {
  return (
    <div className="absolute inset-0 h-full w-full bg-sky-200">
      <Canvas
        key="garden"
        shadows
        camera={{
          position: OVERVIEW_CAMERA.position,
          fov: OVERVIEW_CAMERA.fov,
          near: 0.1,
          far: 120,
        }}
        gl={{ antialias: true, toneMappingExposure: 1.05 }}
        dpr={[1, 1.75]}
      >
        <CameraAim />
        <GardenOverviewScene onFocusArea={onFocusArea} />
      </Canvas>
    </div>
  );
}
