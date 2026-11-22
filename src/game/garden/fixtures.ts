import {
  HEDGE_EAST_NODES,
  MEASURED_DANDELIONS,
  MEASURED_FLOWERS,
} from "@/data/gardenPlacement";
import { createEdgeSegments } from "./edgeFixtures";
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
    out[id] = {
      id,
      x: node.center[0] - 0.65,
      z: node.center[2],
      cut: false,
      overcut: false,
    };
  });
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
      x: -3.6,
      z: 3.1,
      cleared: false,
      blocks: ["lawn-mower", "manual-reel-mower"],
      label: "Hidden stone in the lawn",
    },
    "hedge-hardwood-1": {
      id: "hedge-hardwood-1",
      x: 6.35,
      z: 1.0,
      cleared: false,
      blocks: ["hedge-trimmer"],
      label: "Thick entangled wood in the hedge",
    },
  };
}

/**
 * Initial debris: SW path leaves + light east-hedge litter so same-spot
 * clean→trim→re-clean is playable on a fresh yard (guidance F08).
 */
export function createInitialDebris(): Record<string, DebrisEntity> {
  const spots: { id: string; x: number; z: number; kind: string }[] = [
    { id: "leaf-sw-0", x: -4.5, z: -4.4, kind: "leaf" },
    { id: "leaf-sw-1", x: -3.5, z: -4.2, kind: "leaf" },
    { id: "leaf-sw-2", x: -2.8, z: -4.5, kind: "leaf" },
    { id: "leaf-sw-3", x: -5.2, z: -3.8, kind: "leaf" },
    { id: "leaf-sw-4", x: -3.0, z: -3.9, kind: "leaf" },
    // East hedge face — enables same-area rework demo
    { id: "leaf-east-0", x: 6.2, z: 1.1, kind: "leaf" },
    { id: "leaf-east-1", x: 6.4, z: 0.2, kind: "leaf" },
    { id: "leaf-east-2", x: 6.3, z: -1.0, kind: "leaf" },
  ];
  const out: Record<string, DebrisEntity> = {};
  for (const s of spots) {
    out[s.id] = {
      id: s.id,
      kind: s.kind,
      x: s.x,
      z: s.z,
      state: "scattered",
      sourceActionId: "fixture-initial",
    };
  }
  return out;
}

export function createFreshGardenDomain(): GardenDomain {
  return {
    schemaVersion: 2,
    inspection: {},
    hazards: createHazards(),
    hedgeClusters: createHedgeClusters(),
    plants: createPlants(),
    debris: createInitialDebris(),
    edgeSegments: createEdgeSegments(),
    cleanupHistory: [],
    plan: {
      // Observed work list — not an expert order claim
      taskOrder: ["lawn", "hedge", "debris", "flowerbed", "edge", "hazard"],
      revision: 0,
    },
    effort: emptyEffort(),
    events: [],
    appliedEventIds: [],
    activeTaskId: null,
    focusPoint: null,
    reviewOpen: false,
    visitFinished: false,
    lastVisitNote: null,
  };
}
