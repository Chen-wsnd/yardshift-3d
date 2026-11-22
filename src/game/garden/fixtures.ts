import type {
  DebrisEntity,
  GardenDomain,
  HazardEntity,
  HedgeCluster,
  PlantEntity,
} from "./types";

function emptyEffort() {
  return {
    productive: 0,
    setup: 0,
    rework: 0,
    ineffective: 0,
    recovery: 0,
  };
}

/** Deterministic hedge overgrowth along the east hedge line (garden coords). */
export function createHedgeClusters(): Record<string, HedgeCluster> {
  const out: Record<string, HedgeCluster> = {};
  // Align with hedge-block tiles near x≈6–7, z from -4..4 in starter scene
  const positions = [
    [5.2, -3.2],
    [5.4, -1.6],
    [5.5, 0],
    [5.4, 1.6],
    [5.2, 3.0],
    [5.6, -2.4],
    [5.7, -0.8],
    [5.7, 0.8],
    [5.6, 2.4],
    [4.9, -3.8],
    [4.9, 3.6],
    [5.1, -0.2],
  ] as const;
  positions.forEach(([x, z], i) => {
    const id = `hedge-cluster-${i}`;
    out[id] = { id, x, z, cut: false, overcut: false };
  });
  return out;
}

export function createPlants(): Record<string, PlantEntity> {
  const out: Record<string, PlantEntity> = {};
  // Flowerbed near lawn right border / flower pieces (~x 4–6, z 2–4)
  const weeds: [number, number][] = [
    [3.8, 3.2],
    [4.1, 2.6],
    [4.4, 3.5],
    [3.6, 2.9],
  ];
  weeds.forEach(([x, z], i) => {
    const id = `weed-${i}`;
    out[id] = {
      id,
      kind: "weed",
      x,
      z,
      topCut: false,
      rootRemoved: false,
      ornamentalDamage: false,
    };
  });
  const flowers: [number, number][] = [
    [4.0, 3.0],
    [4.3, 3.3],
    [3.9, 2.7],
  ];
  flowers.forEach(([x, z], i) => {
    const id = `flower-${i}`;
    out[id] = {
      id,
      kind: "flower",
      x,
      z,
      topCut: false,
      rootRemoved: false,
      ornamentalDamage: false,
    };
  });
  return out;
}

export function createHazards(): Record<string, HazardEntity> {
  return {
    "lawn-stone-1": {
      id: "lawn-stone-1",
      // NW lawn corner — discoverable, off common centreline mow paths
      x: -3.6,
      z: 3.1,
      cleared: false,
      blocks: ["lawn-mower", "manual-reel-mower"],
      label: "Hidden stone in the lawn",
    },
    "hedge-hardwood-1": {
      id: "hedge-hardwood-1",
      x: 5.5,
      z: -1.0,
      cleared: false,
      blocks: ["hedge-trimmer"],
      label: "Thick entangled wood in the hedge",
    },
  };
}

/** Light initial leaf scatter near tree/path for debris task. */
export function createInitialDebris(): Record<string, DebrisEntity> {
  const spots: [number, number][] = [
    [-3.5, -4.5],
    [-2.8, -4.2],
    [-3.2, -5.0],
    [2.5, -4.8],
    [3.0, -4.4],
  ];
  const out: Record<string, DebrisEntity> = {};
  spots.forEach(([x, z], i) => {
    const id = `leaf-initial-${i}`;
    out[id] = {
      id,
      kind: "leaf",
      x,
      z,
      state: "scattered",
      sourceActionId: "fixture-initial",
    };
  });
  return out;
}

export function createFreshGardenDomain(): GardenDomain {
  return {
    schemaVersion: 1,
    inspection: {},
    hazards: createHazards(),
    hedgeClusters: createHedgeClusters(),
    plants: createPlants(),
    debris: createInitialDebris(),
    plan: {
      taskOrder: ["hazard", "hedge", "lawn", "edge", "flowerbed", "debris"],
      revision: 0,
    },
    effort: emptyEffort(),
    events: [],
    appliedEventIds: [],
    activeTaskId: null,
    reviewOpen: false,
  };
}
