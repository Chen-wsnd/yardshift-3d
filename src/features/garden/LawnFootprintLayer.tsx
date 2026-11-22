"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import type { InstancedMesh } from "three";
import { Color, Object3D } from "three";
import type { WorkCell } from "@/game/work/types";
import { lawnStepX, lawnStepZ } from "@/data/lawnGrid";

const _obj = new Object3D();
const COL_UNCUT = new Color("#2f5e28");
const COL_PARTIAL = new Color("#5a9a45");
const COL_CUT = new Color("#8fbf6a");
const COL_DAMAGE = new Color("#6b3a2a");

/**
 * Continuous footprint visualisation from fine lawn cells.
 * Tall = uncut, mid = partial, flat = cut, brown bump = flower damage.
 */
export function LawnFootprintLayer({
  cells,
  y = 0.04,
}: {
  cells: WorkCell[];
  y?: number;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const sx = lawnStepX() * 0.92;
  const sz = lawnStepZ() * 0.92;

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
        ? 0.12
        : finished
          ? 0.04
          : partial
            ? 0.08 + (cell.remainingWork / 100) * 0.14
            : 0.28;
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
      <meshStandardMaterial roughness={0.85} metalness={0.02} />
    </instancedMesh>
  );
}
