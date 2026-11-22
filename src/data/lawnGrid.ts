/** Fine lawn grid — single authoritative spatial state for P0 mowing. */

export const LAWN_ZONE_ID = "j1-lawn";

export const LAWN_FINE = {
  cols: 24,
  rows: 16,
  /** World metres covered by the interactive lawn */
  width: 10,
  depth: 8,
  originX: -5,
  originZ: -4,
  /** Half-widths for tool footprints (metres) */
  reelCutWidth: 0.5,
  poweredCutWidth: 0.65,
  /** Minimum drag before any cut (metres) */
  minMoveToCut: 0.15,
  /** Max travel applied per pointer sample (metres) */
  maxStepPerSample: 0.35,
  /** Sample spacing ≤ half cut width */
  sampleSpacingFactor: 0.45,
} as const;

export function lawnStepX() {
  return LAWN_FINE.width / LAWN_FINE.cols;
}

export function lawnStepZ() {
  return LAWN_FINE.depth / LAWN_FINE.rows;
}

export function lawnCellCenter(col: number, row: number): { x: number; z: number } {
  return {
    x: LAWN_FINE.originX + (col + 0.5) * lawnStepX(),
    z: LAWN_FINE.originZ + (row + 0.5) * lawnStepZ(),
  };
}

export function isFlowerBorderCol(col: number): boolean {
  // Rightmost two columns — identifiable border, not the whole lawn
  return col >= LAWN_FINE.cols - 2;
}

export function inLawnBounds(x: number, z: number): boolean {
  return (
    x >= LAWN_FINE.originX &&
    x <= LAWN_FINE.originX + LAWN_FINE.width &&
    z >= LAWN_FINE.originZ &&
    z <= LAWN_FINE.originZ + LAWN_FINE.depth
  );
}
