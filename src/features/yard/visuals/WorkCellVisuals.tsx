"use client";

import { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type { WorkCell, ZoneKind } from "@/game/work/types";
import { MODEL_CATALOG } from "../assets/modelCatalog";

function Glb({
  path,
  scale = 1,
  position,
}: {
  path: string;
  scale?: number;
  position: [number, number, number];
}) {
  const { scene } = useGLTF(path);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return (
    <primitive object={cloned} position={position} scale={scale} />
  );
}

function ProceduralCell({
  cell,
  kind,
}: {
  cell: WorkCell;
  kind: ZoneKind;
}) {
  const damaged = cell.damageKinds.length > 0 || cell.result === "flower_damaged" || cell.result === "scalped";
  const done =
    cell.remainingWork <= 0 ||
    cell.result === "finished" ||
    cell.result === "bagged" ||
    cell.collected;
  const color =
    cell.result === "scalped"
      ? "#8b5a3c"
      : cell.result === "flower_damaged"
        ? "#a33"
        : cell.result === "stubble"
          ? "#6b8f4a"
          : cell.result === "pending_treatment"
            ? "#9a8"
            : done
              ? "#5fa85a"
              : cell.result === "partial"
                ? "#4a7a3a"
                : kind === "hedge"
                  ? "#2f5c2c"
                  : kind === "leaves" || kind === "litter"
                    ? "#c4a35a"
                    : "#3d6b2e";

  if (cell.isPile) {
    return (
      <mesh position={[cell.localX, 0.2, cell.localZ]}>
        <sphereGeometry args={[0.45, 10, 8]} />
        <meshStandardMaterial
          color={cell.collected ? "#7a7" : "#c4a35a"}
          transparent
          opacity={cell.collected ? 0.3 : 1}
        />
      </mesh>
    );
  }

  if (kind === "hedge") {
    return (
      <mesh position={[cell.localX, done ? 0.45 : 0.7, cell.localZ]} castShadow>
        <boxGeometry args={[1.1, done ? 0.9 : 1.3, 0.7]} />
        <meshStandardMaterial color={damaged ? "#4a3020" : color} />
      </mesh>
    );
  }

  if (kind === "flowerbed") {
    return (
      <group position={[cell.localX, 0, cell.localZ]}>
        <mesh position={[0, 0.15, 0]} castShadow>
          <coneGeometry args={[0.2, cell.result === "stubble" ? 0.2 : 0.5, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {cell.protectedKind === "flower" ? (
          <mesh position={[0.15, 0.35, 0.1]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial
              color={cell.damageKinds.includes("flower_damaged") ? "#553" : "#e88"}
            />
          </mesh>
        ) : null}
      </group>
    );
  }

  if (kind === "branch") {
    if (done) return null;
    return (
      <mesh
        position={[cell.localX, 0.15, cell.localZ]}
        rotation={[0.2, 0.4, 0.1]}
        castShadow
      >
        <cylinderGeometry args={[0.08, 0.12, 1.2, 6]} />
        <meshStandardMaterial color="#5c4030" />
      </mesh>
    );
  }

  // lawn / edge / leaves default pad
  return (
    <mesh
      position={[cell.localX, 0.05, cell.localZ]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[kind === "edge" ? 1.2 : 1.8, kind === "edge" ? 1.0 : 1.8]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

export function WorkCellVisual({
  cell,
  kind,
  useModels,
}: {
  cell: WorkCell;
  kind: ZoneKind;
  useModels?: boolean;
}) {
  if (useModels && kind === "lawn" && !cell.isPile) {
    const finished =
      cell.remainingWork <= 0 ||
      cell.result === "finished" ||
      cell.result === "scalped";
    const partial =
      !finished &&
      (cell.result === "partial" || cell.remainingWork < 100);
    const entry = finished
      ? MODEL_CATALOG.lawn_cut
      : MODEL_CATALOG.lawn_uncut;
    return (
      <Suspense fallback={<ProceduralCell cell={cell} kind={kind} />}>
        <group>
          <Glb
            path={entry.localPath}
            scale={partial ? 0.9 : 0.95}
            position={[cell.localX, 0, cell.localZ]}
          />
          {partial ? (
            <Glb
              path={MODEL_CATALOG.lawn_cut.localPath}
              scale={0.55}
              position={[cell.localX, 0.02, cell.localZ]}
            />
          ) : null}
        </group>
      </Suspense>
    );
  }

  if (useModels && kind === "hedge" && MODEL_CATALOG.hedge_block) {
    return (
      <Suspense fallback={<ProceduralCell cell={cell} kind={kind} />}>
        <Glb
          path={MODEL_CATALOG.hedge_block.localPath}
          scale={cell.remainingWork <= 0 ? 0.85 : 1}
          position={[cell.localX, 0, cell.localZ]}
        />
      </Suspense>
    );
  }

  return <ProceduralCell cell={cell} kind={kind} />;
}

if (typeof window !== "undefined") {
  Object.values(MODEL_CATALOG).forEach((m) => {
    try {
      useGLTF.preload(m.localPath);
    } catch {
      /* ignore */
    }
  });
}
