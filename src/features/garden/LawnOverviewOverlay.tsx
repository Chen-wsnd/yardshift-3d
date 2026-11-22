"use client";

import { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "@/game/store/gameStore";
import { MODEL_CATALOG } from "@/features/yard/assets/modelCatalog";
import { V03_GARDEN_JOB_ID } from "@/game/work/gardenFixtures";

function LawnTile({
  path,
  position,
  damaged,
  partial,
}: {
  path: string;
  position: [number, number, number];
  damaged?: boolean;
  partial?: boolean;
}) {
  const { scene } = useGLTF(path);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return (
    <group position={position} scale={partial ? 0.92 : 1}>
      <primitive object={cloned} />
      {damaged ? (
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshStandardMaterial color="#a33" emissive="#400" />
        </mesh>
      ) : null}
      {partial && !damaged ? (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.55, 12]} />
          <meshStandardMaterial color="#6a9a4a" transparent opacity={0.55} />
        </mesh>
      ) : null}
    </group>
  );
}

/** State-driven lawn strips replacing baked half-mowed tiles in the overview. */
export function LawnOverviewOverlay() {
  const job = useGameStore((s) => s.work.jobs[V03_GARDEN_JOB_ID]);
  const zone = job?.zones.find((z) => z.id === "j1-lawn");
  if (!zone) return null;

  return (
    <group>
      {zone.cells.map((cell) => {
        const finished =
          cell.remainingWork <= 0 ||
          cell.result === "finished" ||
          cell.result === "scalped";
        const partial = cell.result === "partial" || (cell.remainingWork < 100 && !finished);
        const damaged =
          cell.result === "flower_damaged" ||
          cell.damageKinds.includes("flower_damaged");
        const path = finished
          ? MODEL_CATALOG.lawn_cut.localPath
          : MODEL_CATALOG.lawn_uncut.localPath;
        return (
          <Suspense key={cell.id} fallback={null}>
            <LawnTile
              path={path}
              position={[cell.localX, 0.02, cell.localZ]}
              damaged={damaged}
              partial={partial}
            />
          </Suspense>
        );
      })}
    </group>
  );
}
