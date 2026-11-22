"use client";

import { AREA_PLACEMENTS } from "@/data/gardenPlacement";

const COLORS: Record<string, string> = {
  lawn: "#7cb342",
  hedge: "#2e7d32",
  flowerbed: "#ec407a",
  edge: "#42a5f5",
  debris: "#ffb300",
  hazard: "#8d6e63",
};

/** Dev/QA-only translucent bounds from gardenPlacement (default off). */
export function SceneRegistrationDebug({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <group>
      {Object.values(AREA_PLACEMENTS).map((a) => (
        <mesh key={a.id} position={a.hotspotCenter}>
          <boxGeometry args={[a.hotspotSize[0], 0.08, a.hotspotSize[2]]} />
          <meshBasicMaterial
            color={COLORS[a.id] ?? "#fff"}
            transparent
            opacity={0.28}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
