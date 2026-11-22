/**
 * Unified area placement derived from measured GLB world bounds.
 * Source: docs/v06-scene-placement-audit.json (scripts/inspectGardenScene.mjs)
 * provenance MEASURED = Box3.setFromObject after updateWorldMatrix;
 * MANUAL_OFFSET = intentional gameplay offset from measured node (documented).
 */

export type Vec3 = [number, number, number];

export interface AreaPlacement {
  id: string;
  sourceNodeNames: string[];
  worldCenter: Vec3;
  worldSize: Vec3;
  hotspotCenter: Vec3;
  hotspotSize: Vec3;
  cameraPosition: Vec3;
  cameraTarget: Vec3;
  provenance: "MEASURED" | "MEASURED+MANUAL_OFFSET" | "P0_LAWN_GRID";
  notes: string;
}

/** P0 authoritative mow grid — not re-derived from hidden lawn tiles. */
export const LAWN_PLACEMENT: AreaPlacement = {
  id: "lawn",
  sourceNodeNames: ["LAWN_FINE work grid (P0)"],
  worldCenter: [0, 0.05, 0],
  worldSize: [10, 0.1, 8],
  hotspotCenter: [0, 0.05, 0],
  hotspotSize: [10, 0.05, 8],
  cameraPosition: [2, 9, 9],
  cameraTarget: [0, 0, 0],
  provenance: "P0_LAWN_GRID",
  notes:
    "Work authority remains LAWN_FINE origin=(-5,-4) 10×8. GLB lawn tiles are hidden.",
};

/**
 * East hedge run: nodes 055–059 at x≈7, z=-3..5 (MEASURED).
 * Overlay clusters sit slightly lawn-ward (x≈6.35) so clippings fall on ground.
 */
export const HEDGE_EAST_NODES = [
  { name: "055-hedge-block-2m", center: [7.001, 0.615, 4.999] as Vec3 },
  { name: "056-hedge-block-2m", center: [7.001, 0.615, 2.999] as Vec3 },
  { name: "057-hedge-block-2m", center: [7.001, 0.615, 0.999] as Vec3 },
  { name: "058-hedge-block-2m", center: [7.001, 0.615, -1.001] as Vec3 },
  { name: "059-hedge-block-2m", center: [7.001, 0.615, -3.001] as Vec3 },
  { name: "062-hedge-corner", center: [6.68, 0.615, 6.7] as Vec3 },
] as const;

export const HEDGE_PLACEMENT: AreaPlacement = {
  id: "hedge",
  sourceNodeNames: HEDGE_EAST_NODES.map((n) => n.name),
  worldCenter: [7.001, 0.615, 1.0],
  worldSize: [1.2, 1.231, 10.0],
  hotspotCenter: [6.4, 0.05, 1.0],
  hotspotSize: [2.4, 0.05, 10],
  cameraPosition: [11, 5.5, 3],
  cameraTarget: [6.5, 0.8, 1],
  provenance: "MEASURED+MANUAL_OFFSET",
  notes:
    "Hotspot shifted −0.6m in X toward lawn from measured hedge centres for clickability.",
};

/** Measured flower-bed-border pieces (west border near shed). */
export const FLOWERBED_PLACEMENT: AreaPlacement = {
  id: "flowerbed",
  sourceNodeNames: [
    "115-flower-bed-border-piece",
    "116-flower-bed-border-piece",
    "111-dandelion-clump",
    "112-dandelion-clump",
    "113-dandelion-clump",
    "114-dandelion-clump",
  ],
  worldCenter: [-6.3, 0.31, 2.25],
  worldSize: [1.2, 0.5, 3.3],
  hotspotCenter: [-6.3, 0.08, 2.25],
  hotspotSize: [2.2, 0.05, 3.6],
  cameraPosition: [-3, 4.5, 4],
  cameraTarget: [-6.3, 0.3, 2.25],
  provenance: "MEASURED",
  notes: "West border pieces MEASURED; weeds also spawn at measured dandelion sites.",
};

/** Measured path slabs — south/west walkway; edge work follows lawn–path interface. */
export const EDGE_PLACEMENT: AreaPlacement = {
  id: "edge",
  sourceNodeNames: ["064-path-slab", "065-path-slab", "…", "078-path-slab"],
  worldCenter: [-3.2, 0.11, -3.05],
  worldSize: [7.3, 0.1, 4.0],
  hotspotCenter: [0, 0.05, -3.6],
  hotspotSize: [8, 0.05, 1.6],
  cameraPosition: [0, 6, -7],
  cameraTarget: [0, 0, -3.5],
  provenance: "MEASURED+MANUAL_OFFSET",
  notes:
    "Path cluster MEASURED SW; edge strip uses south lawn band (z≈-3.6) where path meets work grid.",
};

export const DEBRIS_PLACEMENT: AreaPlacement = {
  id: "debris",
  sourceNodeNames: ["event-spawned + initial near path"],
  worldCenter: [-3.0, 0.05, -4.2],
  worldSize: [6, 0.1, 2.5],
  hotspotCenter: [-3.0, 0.05, -4.2],
  hotspotSize: [6.5, 0.05, 2.8],
  cameraPosition: [-2, 7, -1],
  cameraTarget: [-3, 0, -4.2],
  provenance: "MEASURED+MANUAL_OFFSET",
  notes: "Initial leaves near measured path; hedge clippings spawn at cluster ground XZ.",
};

export const HAZARD_PLACEMENT: AreaPlacement = {
  id: "hazard",
  sourceNodeNames: ["overlay:lawn-stone-1", "overlay:hedge-hardwood-1"],
  worldCenter: [-3.6, 0.1, 3.1],
  worldSize: [1.8, 0.3, 1.8],
  hotspotCenter: [-3.6, 0.08, 3.1],
  hotspotSize: [1.8, 0.05, 1.8],
  cameraPosition: [-1, 6, 6],
  cameraTarget: [-3.6, 0.1, 3.1],
  provenance: "MEASURED+MANUAL_OFFSET",
  notes:
    "No rock in starter GLB; stone overlay on NW lawn. Hardwood near east hedge 057.",
};

export const AREA_PLACEMENTS: Record<string, AreaPlacement> = {
  lawn: LAWN_PLACEMENT,
  hedge: HEDGE_PLACEMENT,
  flowerbed: FLOWERBED_PLACEMENT,
  edge: EDGE_PLACEMENT,
  debris: DEBRIS_PLACEMENT,
  hazard: HAZARD_PLACEMENT,
};

/** Measured dandelion clump centres — weeds in garden domain. */
export const MEASURED_DANDELIONS: { id: string; x: number; z: number }[] = [
  { id: "weed-111", x: 3.0, z: 0.9 },
  { id: "weed-112", x: -0.5, z: 4.9 },
  { id: "weed-113", x: 6.1, z: 4.2 },
  { id: "weed-114", x: 2.2, z: 6.4 },
];

/** Ornamentals near west flower-bed-border (MEASURED border + slight offset). */
export const MEASURED_FLOWERS: { id: string; x: number; z: number }[] = [
  { id: "flower-0", x: -6.1, z: 1.5 },
  { id: "flower-1", x: -6.15, z: 2.3 },
  { id: "flower-2", x: -6.05, z: 3.0 },
];
