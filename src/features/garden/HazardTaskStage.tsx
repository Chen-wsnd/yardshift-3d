"use client";

import { useGameStore } from "@/game/store/gameStore";
import { GardenWorldOverlays } from "./GardenWorldOverlays";

export function HazardTaskStage() {
  const hazards = useGameStore((s) => s.work.garden?.hazards);
  const inspectObject = useGameStore((s) => s.inspectObject);
  const removeHazard = useGameStore((s) => s.removeHazard);
  const inspection = useGameStore((s) => s.work.garden?.inspection);

  if (!hazards) return null;

  return (
    <group>
      <GardenWorldOverlays />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#6a9a4e" />
      </mesh>
      {Object.values(hazards).map((h) => {
        if (h.cleared) return null;
        const seen = inspection?.[h.id]?.observed;
        return (
          <mesh
            key={h.id}
            position={[h.x, 0.2, h.z]}
            onClick={(e) => {
              e.stopPropagation();
              if (!seen) inspectObject(h.id);
              else removeHazard(h.id);
            }}
          >
            <dodecahedronGeometry args={[0.28, 0]} />
            <meshStandardMaterial color={seen ? "#c45" : "#888"} />
          </mesh>
        );
      })}
    </group>
  );
}
