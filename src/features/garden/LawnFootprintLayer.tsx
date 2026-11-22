"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import type { InstancedMesh } from "three";
import { Color, Object3D } from "three";
import type { WorkCell } from "@/game/work/types";
import { lawnStepX, lawnStepZ } from "@/data/lawnGrid";

const _obj = new Object3D();
const COL_UNCUT = new Color("#2a5524");
const COL_PARTIAL = new Color("#5a9a45");
const COL_CUT = new Color("#9bc978");
const COL_DAMAGE = new Color("#6b3a2a");

/**
 * Continuous footprint visualisation from fine lawn cells.
 * Softened tiles (less hard mosaic): tall uncut → flat bright cut.
 */
export function LawnFootprintLayer({
  cells,
  y = 0.04,
}: {
  cells: WorkCell[];
  y?: number;
}) {
  const mesh = useRef<InstancedMesh>(null);
  // Slight overlap softens the grid look for learners (G06)
  const sx = lawnStepX() * 1.02;
  const sz = lawnStepZ() * 1.02;

  const grassCells = useMemo(
    () => cells.filter((c) => !c.isPile),
    [cells],
  );

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    grassCells.forEach((cell, i) => {
      const damaged =
        cell.result === "flower_damaged" ||
        cell.damageKinds.includes("flower_damaged");
      const finished = cell.remainingWork <= 0 && !damaged;
      const partial =
        !finished &&
        !damaged &&
        (cell.result === "partial" || cell.remainingWork < 100);
      const height = damaged
        ? 0.1
        : finished
          ? 0.028
          : partial
            ? 0.07 + (cell.remainingWork / 100) * 0.12
            : 0.22;
      _obj.position.set(cell.localX, y + height * 0.5, cell.localZ);
      _obj.scale.set(sx, height, sz);
      _obj.updateMatrix();
      m.setMatrixAt(i, _obj.matrix);
      const color = damaged
        ? COL_DAMAGE
        : finished
          ? COL_CUT
          : partial
            ? COL_PARTIAL
            : COL_UNCUT;
      m.setColorAt(i, color);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [grassCells, sx, sz, y]);

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, grassCells.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.9} metalness={0} />
    </instancedMesh>
  );
}
