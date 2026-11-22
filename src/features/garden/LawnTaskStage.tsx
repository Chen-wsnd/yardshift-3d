"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useGameStore } from "@/game/store/gameStore";
import { V03_GARDEN_JOB_ID } from "@/game/work/gardenFixtures";
import {
  LAWN_FINE,
  LAWN_ZONE_ID,
  inLawnBounds,
} from "@/data/lawnGrid";
import { clampPointerStep, interpolateSamples } from "@/game/work/lawnSweep";
import { MODEL_CATALOG } from "@/features/yard/assets/modelCatalog";
import { LawnFootprintLayer } from "./LawnFootprintLayer";
import { MowerTool } from "./MowerTool";

function FlowerBorderDecor({ cells }: { cells: { localX: number; localZ: number; damaged: boolean }[] }) {
  const { scene } = useGLTF(MODEL_CATALOG.flower_border.localPath);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  // One border strip along the right edge
  const zMid =
    cells.reduce((s, c) => s + c.localZ, 0) / Math.max(1, cells.length);
  const x =
    cells.reduce((s, c) => s + c.localX, 0) / Math.max(1, cells.length);
  return (
    <group position={[x + 0.15, 0, zMid]}>
      <primitive object={cloned} scale={1.1} />
      {cells
        .filter((c) => c.damaged)
        .map((c, i) => (
          <mesh key={i} position={[c.localX - x, 0.35, c.localZ - zMid]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#4a2a18" />
          </mesh>
        ))}
    </group>
  );
}

/**
 * Continuous mowing: press starts drag only; cuts require real ground travel.
 * OrbitControls must be disabled by parent while dragging.
 */
export function LawnTaskStage({
  onDragChange,
}: {
  onDragChange?: (dragging: boolean) => void;
}) {
  const job = useGameStore((s) => s.work.jobs[V03_GARDEN_JOB_ID]);
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const performWorkAction = useGameStore((s) => s.performWorkAction);
  const toolResource = useGameStore((s) =>
    s.work.selectedToolId
      ? s.work.tools[s.work.selectedToolId]?.resource
      : 100,
  );
  const zone = job?.zones.find((z) => z.id === LAWN_ZONE_ID);

  const dragging = useRef(false);
  const armed = useRef(false); // passed min move
  const lastPoint = useRef<{ x: number; z: number } | null>(null);
  const facing = useRef<[number, number]>([0, 1]);
  const dragOrigin = useRef<{ x: number; z: number } | null>(null);

  const [mowerPos, setMowerPos] = useState<[number, number, number]>([0, 0, 0]);
  const [dir, setDir] = useState<[number, number]>([0, 1]);
  const [moving, setMoving] = useState(false);
  const [cutting, setCutting] = useState(false);

  const kind =
    selectedToolId === "lawn-mower" ? "lawn-mower" : "manual-reel-mower";
  const cutWidth =
    kind === "lawn-mower"
      ? LAWN_FINE.poweredCutWidth
      : LAWN_FINE.reelCutWidth;

  if (!zone) return null;

  const flowerCells = zone.cells
    .filter((c) => c.protectedKind === "flower")
    .map((c) => ({
      localX: c.localX,
      localZ: c.localZ,
      damaged:
        c.result === "flower_damaged" ||
        c.damageKinds.includes("flower_damaged"),
    }));

  const endDrag = () => {
    dragging.current = false;
    armed.current = false;
    lastPoint.current = null;
    dragOrigin.current = null;
    setMoving(false);
    setCutting(false);
    onDragChange?.(false);
  };

  const onMove = (point: { x: number; z: number }) => {
    if (!dragging.current || !selectedToolId) return;
    const origin = dragOrigin.current;
    if (!origin) return;

    const total = Math.hypot(point.x - origin.x, point.z - origin.z);
    if (!armed.current) {
      if (total < LAWN_FINE.minMoveToCut) {
        setMowerPos([point.x, 0, point.z]);
        return;
      }
      armed.current = true;
    }

    const prev = lastPoint.current ?? origin;
    const clamped = clampPointerStep(prev, { x: point.x, z: point.z });
    const interpolated = interpolateSamples(prev, clamped, cutWidth);
    // Include stroke origin so pathLength covers the full world segment (G07)
    const samples =
      interpolated.length === 0 ? [] : [prev, ...interpolated];
    if (samples.length < 2) {
      setMowerPos([clamped.x, 0, clamped.z]);
      lastPoint.current = clamped;
      return;
    }
    const last = samples[samples.length - 1];
    const dx = last.x - prev.x;
    const dz = last.z - prev.z;
    const len = Math.hypot(dx, dz);
    let forward = true;
    if (len > 0.01) {
      const nd: [number, number] = [dx / len, dz / len];
      const dot = nd[0] * facing.current[0] + nd[1] * facing.current[1];
      forward = dot >= -0.15;
      if (forward || kind === "lawn-mower") {
        facing.current = nd;
        setDir(nd);
      }
    }

    lastPoint.current = last;
    setMowerPos([last.x, 0, last.z]);
    setMoving(true);

    const inBounds = samples.some((s) => inLawnBounds(s.x, s.z));
    if (!inBounds) {
      setCutting(false);
      return;
    }

    const batteryOk =
      kind !== "lawn-mower" || (toolResource != null && toolResource > 0);
    if (!batteryOk) {
      setCutting(false);
      return;
    }

    setCutting(true);
    performWorkAction({
      jobId: V03_GARDEN_JOB_ID,
      zoneId: LAWN_ZONE_ID,
      toolId: selectedToolId,
      action: "cut",
      worldX: last.x,
      worldZ: last.z,
      strokeId: `sweep-${performance.now()}`,
      direction: facing.current,
      sweepSamples: samples,
      forwardMotion: forward,
    });
  };

  return (
    <group>
      {/* Ground plane for raycasts */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          dragging.current = true;
          armed.current = false;
          dragOrigin.current = { x: e.point.x, z: e.point.z };
          lastPoint.current = { x: e.point.x, z: e.point.z };
          setMowerPos([e.point.x, 0, e.point.z]);
          setMoving(false);
          setCutting(false);
          onDragChange?.(true);
          (
            e.target as unknown as { setPointerCapture?: (id: number) => void }
          ).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          e.stopPropagation();
          onMove(e.point);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          endDrag();
        }}
        onPointerCancel={(e) => {
          e.stopPropagation();
          endDrag();
        }}
        onPointerLeave={() => {
          if (dragging.current) endDrag();
        }}
      >
        <planeGeometry args={[LAWN_FINE.width + 2, LAWN_FINE.depth + 2]} />
        <meshStandardMaterial color="#6a9a4e" roughness={1} />
      </mesh>

      <LawnFootprintLayer cells={zone.cells} />

      <Suspense fallback={null}>
        <FlowerBorderDecor cells={flowerCells} />
      </Suspense>

      <MowerTool
        kind={kind}
        position={mowerPos}
        direction={dir}
        moving={moving}
        cutting={cutting}
      />
    </group>
  );
}

useGLTF.preload(MODEL_CATALOG.flower_border.localPath);
