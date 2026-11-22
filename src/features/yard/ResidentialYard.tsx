"use client";

import { OrbitControls, Sky } from "@react-three/drei";
import { SCENE_LAYOUTS } from "@/data/sceneLayouts";
import { useGameStore } from "@/game/store/gameStore";
import { Fence } from "./Fence";
import { Ground } from "./Ground";
import { FocusedWorkView } from "./FocusedWorkView";
import { ZoneHotspots } from "./ZoneHotspots";
import { HouseFacade } from "./visuals/HouseFacade";

export function ResidentialYard() {
  const activeJobId = useGameStore((s) => s.work.activeJobId);
  const focusedZoneId = useGameStore((s) => s.work.focusedZoneId);
  const layout =
    SCENE_LAYOUTS[activeJobId ?? "job-overgrown-lawn"] ??
    SCENE_LAYOUTS["job-overgrown-lawn"];

  return (
    <>
      <color attach="background" args={["#c5daf0"]} />
      <Sky sunPosition={[6, 12, 4]} inclination={0.49} azimuth={0.25} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={["#d7e9ff", "#6b8f5a", 0.4]} />
      <directionalLight
        castShadow
        position={[9, 16, 7]}
        intensity={1.3}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Ground />
      <Fence />
      <HouseFacade layout={layout} />

      {focusedZoneId ? <FocusedWorkView /> : <ZoneHotspots />}

      <OrbitControls
        makeDefault
        enablePan
        enableRotate={!focusedZoneId}
        minDistance={4}
        maxDistance={28}
        maxPolarAngle={Math.PI / 2.08}
        target={[0, 0.5, focusedZoneId ? 0 : -1]}
      />
    </>
  );
}
