"use client";

import { Suspense, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { MOUSE } from "three";
import { OVERVIEW_CAMERA } from "@/data/gardenScene";
import { useGameStore } from "@/game/store/gameStore";
import { SaturdayGardenModel } from "./SaturdayGardenModel";
import { GardenHotspots } from "./GardenHotspots";
import { GardenWorldOverlays } from "./GardenWorldOverlays";
import { GardenInteractionLayer } from "./GardenInteractionLayer";
import { SceneRegistrationDebug } from "./SceneRegistrationDebug";

/** Disable left-button orbit so R3F work gestures own LMB (G12). */
const ORBIT_NO_LEFT = -1 as unknown as (typeof MOUSE)["ROTATE"];

/**
 * Single continuous yard — always the same world + tool-scoped interaction (GATE-G).
 * Camera focus never remounts this scene tree's Canvas parent.
 */
export function GardenOverviewScene({
  onFocusArea,
}: {
  onFocusArea?: (areaId: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const focus = useGameStore((s) => s.work.garden?.focusPoint);
  const debugPlacement =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debugPlacement");

  const orbitTarget: [number, number, number] = focus
    ? [focus.x, 0, focus.z]
    : (OVERVIEW_CAMERA.target as [number, number, number]);

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

      <Suspense fallback={null}>
        <SaturdayGardenModel />
        {/* Always presentational — interaction owned by tool layer */}
        <GardenWorldOverlays includeLawn excludeTask="all" />
      </Suspense>

      <GardenInteractionLayer onDragChange={setDragging} />

      <GardenHotspots
        onSelect={(id) => {
          onFocusArea?.(id);
        }}
      />
      <SceneRegistrationDebug enabled={debugPlacement} />

      <OrbitControls
        makeDefault
        target={orbitTarget}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={6}
        maxDistance={26}
        enablePan
        enableRotate
        enableZoom
        enabled={!dragging}
        // G12: LMB = tool work · RMB = orbit · MMB = pan · wheel = zoom
        mouseButtons={{
          LEFT: ORBIT_NO_LEFT,
          MIDDLE: MOUSE.PAN,
          RIGHT: MOUSE.ROTATE,
        }}
      />
    </>
  );
}
