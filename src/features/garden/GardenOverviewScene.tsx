"use client";

import { Suspense, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { SaturdayGardenModel } from "./SaturdayGardenModel";
import { LawnOverviewOverlay } from "./LawnOverviewOverlay";
import { LawnHotspot } from "./LawnHotspot";
import { LawnTaskStage } from "./LawnTaskStage";
import { OVERVIEW_CAMERA } from "@/data/gardenScene";

export function GardenOverviewScene({
  mode,
  onSelectLawn,
}: {
  mode: "overview" | "lawn-task";
  onSelectLawn: () => void;
}) {
  const [dragging, setDragging] = useState(false);

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

      {mode === "overview" ? (
        <>
          <Suspense fallback={null}>
            <SaturdayGardenModel />
            <LawnOverviewOverlay />
          </Suspense>
          <LawnHotspot onSelect={onSelectLawn} />
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
          <LawnTaskStage onDragChange={setDragging} />
          <OrbitControls
            makeDefault
            target={[0, 0, 0]}
            maxPolarAngle={Math.PI / 2.35}
            minDistance={7}
            maxDistance={16}
            enablePan={false}
            enabled={!dragging}
          />
        </>
      )}
    </>
  );
}
