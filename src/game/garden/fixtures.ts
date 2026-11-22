import {
  HEDGE_EAST_NODES,
  MEASURED_DANDELIONS,
  MEASURED_FLOWERS,
} from "@/data/gardenPlacement";
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

/**
 * Hedge overgrowth clusters along MEASURED east hedge (nodes 055–059 + corner).
 * Positions offset lawn-ward so overlays sit on the face players can reach.
 */
export function createHedgeClusters(): Record<string, HedgeCluster> {
  const out: Record<string, HedgeCluster> = {};
  HEDGE_EAST_NODES.forEach((node, i) => {
    const id = `hedge-cluster-${i}`;
    // MANUAL_OFFSET: −0.65m X toward lawn from measured centre
    out[id] = {
      id,
      x: node.center[0] - 0.65,
      z: node.center[2],
      cut: false,
      overcut: false,
    };
  });
  // Extra mid-face clusters between blocks for denser overgrowth
  const extras: [number, number][] = [
    [6.35, 4.0],
    [6.35, 2.0],
    [6.35, 0.0],
    [6.35, -2.0],
    [6.2, 5.8],
    [6.35, -0.5],
  ];
  extras.forEach(([x, z], i) => {
    const id = `hedge-cluster-extra-${i}`;
    out[id] = { id, x, z, cut: false, overcut: false };
  });
  return out;
}

export function createPlants(): Record<string, PlantEntity> {
  const out: Record<string, PlantEntity> = {};
  MEASURED_DANDELIONS.forEach((d) => {
    out[d.id] = {
      id: d.id,
      kind: "weed",
      x: d.x,
      z: d.z,
      topCut: false,
      rootRemoved: false,
      ornamentalDamage: false,
    };
  });
  // Extra weeds along west flower border (near MEASURED border pieces)
  const borderWeeds: [number, number][] = [
    [-6.0, 1.8],
    [-6.05, 2.6],
    [-5.95, 3.2],
  ];
  borderWeeds.forEach(([x, z], i) => {
    const id = `weed-border-${i}`;
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
  MEASURED_FLOWERS.forEach((f) => {
    out[f.id] = {
      id: f.id,
      kind: "flower",
      x: f.x,
      z: f.z,
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
      // NW of P0 lawn work grid — discoverable, off centreline mow tests
      x: -3.6,
      z: 3.1,
      cleared: false,
      blocks: ["lawn-mower", "manual-reel-mower"],
      label: "Hidden stone in the lawn",
    },
    "hedge-hardwood-1": {
      id: "hedge-hardwood-1",
      // Near measured hedge 057 (7, 0.999) — lawn-ward face
      x: 6.35,
      z: 1.0,
      cleared: false,
      blocks: ["hedge-trimmer"],
      label: "Thick entangled wood in the hedge",
    },
  };
}

/** Initial leaf scatter near MEASURED path slabs (south-west). */
export function createInitialDebris(): Record<string, DebrisEntity> {
  const spots: [number, number][] = [
    [-4.5, -4.4],
    [-3.5, -4.2],
    [-2.8, -4.5],
    [-5.2, -3.8],
    [-3.0, -3.9],
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
