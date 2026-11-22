"use client";

import { Suspense, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { getGardenTask } from "@/data/gardenTasks";
import { OVERVIEW_CAMERA } from "@/data/gardenScene";
import { SaturdayGardenModel } from "./SaturdayGardenModel";
import { GardenHotspots } from "./GardenHotspots";
import { GardenWorldOverlays } from "./GardenWorldOverlays";
import { LawnTaskStage } from "./LawnTaskStage";
import { HedgeTaskStage } from "./HedgeTaskStage";
import { DebrisTaskStage } from "./DebrisTaskStage";
import { FlowerbedTaskStage } from "./FlowerbedTaskStage";
import { HazardTaskStage } from "./HazardTaskStage";
import { EdgeTaskStage } from "./EdgeTaskStage";
import { useGameStore } from "@/game/store/gameStore";
import { SceneRegistrationDebug } from "./SceneRegistrationDebug";

export function GardenOverviewScene({
  activeTaskId,
  onSelectTask,
}: {
  activeTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const task = activeTaskId ? getGardenTask(activeTaskId) : null;
  const focus = useGameStore((s) => s.work.garden?.focusPoint);
  const debugPlacement =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debugPlacement");
  const orbitTarget =
    activeTaskId === "debris" && focus
      ? ([focus.x, 0, focus.z] as [number, number, number])
      : (task?.camera.target ?? [0, 0, 0]);

  return (
    <>
      <color attach="background" args={["#9ebfe0"]} />
      <ambientLight intensity={0.7} />
      <directionalLight
        castShadow
        position={[10, 16, 8]}
        intensity={1.15}
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight args={["#dff0ff", "#6a7a4a", 0.45]} />

      {!activeTaskId ? (
        <>
          <Suspense fallback={null}>
            <SaturdayGardenModel />
            <GardenWorldOverlays />
          </Suspense>
          <GardenHotspots onSelect={onSelectTask} />
          <SceneRegistrationDebug enabled={debugPlacement} />
          <OrbitControls
            makeDefault
            target={OVERVIEW_CAMERA.target}
            maxPolarAngle={Math.PI / 2.15}
            minDistance={8}
            maxDistance={26}
            enablePan={false}
          />
        </>
      ) : (
        <>
          {/* Same Saturday garden base so task stages share overview world space */}
          <Suspense fallback={null}>
            <SaturdayGardenModel />
            <GardenWorldOverlays
              includeLawn={
                activeTaskId === "edge" || activeTaskId === "hazard"
              }
            />
          </Suspense>
          {activeTaskId === "lawn" ? (
            <LawnTaskStage onDragChange={setDragging} />
          ) : null}
          {activeTaskId === "hedge" ? (
            <HedgeTaskStage onDragChange={setDragging} />
          ) : null}
          {activeTaskId === "debris" ? (
            <DebrisTaskStage onDragChange={setDragging} />
          ) : null}
          {activeTaskId === "flowerbed" ? <FlowerbedTaskStage /> : null}
          {activeTaskId === "hazard" ? <HazardTaskStage /> : null}
          {activeTaskId === "edge" ? (
            <EdgeTaskStage onDragChange={setDragging} />
          ) : null}
          <OrbitControls
            makeDefault
            target={orbitTarget}
            maxPolarAngle={Math.PI / 2.35}
            minDistance={5}
            maxDistance={18}
            enablePan={activeTaskId === "debris"}
            enabled={!dragging}
          />
        </>
      )}
    </>
  );
}
