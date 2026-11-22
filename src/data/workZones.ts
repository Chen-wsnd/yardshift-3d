import type { WorkCell, WorkZone, ZoneKind } from "@/game/work/types";

function gridCells(
  zoneId: string,
  cols: number,
  rows: number,
  originX: number,
  originZ: number,
  step: number,
  tags: string[] = [],
  protectedEvery?: number,
): WorkCell[] {
  const cells: WorkCell[] = [];
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      i++;
      const isFlower =
        protectedEvery != null && i % protectedEvery === 0 ? "flower" : null;
      cells.push({
        id: `${zoneId}-c${c}-${r}`,
        zoneId,
        localX: originX + c * step,
        localZ: originZ + r * step,
        remainingWork: 100,
        result: "untouched",
        damageKinds: [],
        collected: false,
        tags: isFlower ? [...tags, "protected_flower"] : [...tags],
        protectedKind: isFlower,
      });
    }
  }
  return cells;
}

function zone(
  partial: Omit<WorkZone, "cells"> & { cells: WorkCell[] },
): WorkZone {
  return partial;
}

/** Job 1 — Maple Lane Weekly Lawn Care */
export function createJob1Zones(): WorkZone[] {
  const lawn = gridCells("j1-lawn", 4, 4, -4, -2, 2); // 16 cells
  const edge = gridCells("j1-path-edge", 7, 1, -6, 4.5, 1.7, ["edge"]); // 7
  const leaves = gridCells("j1-tree-leaves", 3, 2, 3, -5, 1.4, ["leaf"]); // 6
  // dedicated pile cell
  leaves.push({
    id: "j1-tree-leaves-pile",
    zoneId: "j1-tree-leaves",
    localX: 5.5,
    localZ: -3.5,
    remainingWork: 0,
    result: "untouched",
    damageKinds: [],
    collected: false,
    tags: ["pile"],
    isPile: true,
  });
  const fence = gridCells("j1-fence-grass", 6, 1, -7, -6.5, 2.2, [
    "edge",
    "weed",
  ]); // 6

  return [
    zone({
      id: "j1-lawn",
      jobId: "job-overgrown-lawn",
      kind: "lawn",
      name: "Main Lawn",
      cameraTarget: [0, 1, 0],
      bounds: { x: -4, z: -2, width: 8, depth: 8 },
      cells: lawn,
      essential: true,
    }),
    zone({
      id: "j1-path-edge",
      jobId: "job-overgrown-lawn",
      kind: "edge",
      name: "Path Edge",
      cameraTarget: [0, 1, 4.5],
      bounds: { x: -6, z: 4, width: 12, depth: 2 },
      cells: edge,
      essential: true,
    }),
    zone({
      id: "j1-tree-leaves",
      jobId: "job-overgrown-lawn",
      kind: "leaves",
      name: "Tree Leaves",
      cameraTarget: [4, 1.2, -4],
      bounds: { x: 2, z: -6, width: 6, depth: 4 },
      cells: leaves,
      essential: true,
    }),
    zone({
      id: "j1-fence-grass",
      jobId: "job-overgrown-lawn",
      kind: "edge",
      name: "Fence Line Weeds",
      cameraTarget: [-4, 1, -6],
      bounds: { x: -8, z: -7.5, width: 14, depth: 2 },
      cells: fence,
      essential: true,
    }),
  ];
}

/** Job 2 — Willow House Backyard Restoration */
export function createJob2Zones(): WorkZone[] {
  const litterLeaves = gridCells("j2-patio-debris", 3, 2, -5, 2, 1.5, ["leaf"]);
  // 4 litter props as cells
  for (let i = 0; i < 4; i++) {
    litterLeaves.push({
      id: `j2-patio-debris-litter-${i}`,
      zoneId: "j2-patio-debris",
      localX: -3 + i * 1.2,
      localZ: 4,
      remainingWork: 100,
      result: "untouched",
      damageKinds: [],
      collected: false,
      tags: ["litter"],
    });
  }
  litterLeaves.push({
    id: "j2-patio-debris-pile",
    zoneId: "j2-patio-debris",
    localX: -1,
    localZ: 5.2,
    remainingWork: 0,
    result: "untouched",
    damageKinds: [],
    collected: false,
    tags: ["pile"],
    isPile: true,
  });

  const hedge = gridCells("j2-hedge", 6, 2, 3, -4, 1.3, ["hedge"]); // 12
  // Visibly entangled segments (jam risk for shears/loppers)
  hedge[2].tags.push("entangled", "coarse_wood");
  hedge[7].tags.push("entangled", "coarse_wood");

  const flower = gridCells("j2-flowerbed", 3, 2, 4, 2, 1.4, ["weed"], 3); // 6 weeds, every 3rd protected flower
  // ensure 3 protected flowers
  flower.forEach((c, idx) => {
    if (idx % 2 === 1) {
      c.protectedKind = "flower";
      c.tags = [...new Set([...c.tags, "protected_flower"])];
    }
  });

  const branches: WorkCell[] = [
    {
      id: "j2-tree-corner-b0",
      zoneId: "j2-tree-corner",
      localX: -6,
      localZ: -5,
      remainingWork: 100,
      result: "untouched",
      damageKinds: [],
      collected: false,
      tags: ["branch"],
    },
    {
      id: "j2-tree-corner-b1",
      zoneId: "j2-tree-corner",
      localX: -4.5,
      localZ: -6,
      remainingWork: 100,
      result: "untouched",
      damageKinds: [],
      collected: false,
      tags: ["branch", "entangled", "coarse_wood"],
    },
    ...gridCells("j2-tree-corner", 3, 1, -7, -3.5, 1.5, ["leaf"]).map((c) => ({
      ...c,
      id: c.id.replace("j2-tree-corner", "j2-tree-corner-clean"),
    })),
  ];

  return [
    zone({
      id: "j2-patio-debris",
      jobId: "job-backyard-restoration",
      kind: "litter",
      name: "Patio Debris",
      cameraTarget: [-2, 1.2, 3.5],
      bounds: { x: -6, z: 1.5, width: 8, depth: 5 },
      cells: litterLeaves,
      essential: true,
    }),
    zone({
      id: "j2-hedge",
      jobId: "job-backyard-restoration",
      kind: "hedge",
      name: "Side Hedge",
      cameraTarget: [5, 1.4, -3],
      bounds: { x: 2.5, z: -5, width: 8, depth: 4 },
      cells: hedge,
      essential: true,
    }),
    zone({
      id: "j2-flowerbed",
      jobId: "job-backyard-restoration",
      kind: "flowerbed",
      name: "Flowerbed",
      cameraTarget: [5, 1.1, 2.5],
      bounds: { x: 3, z: 1, width: 5, depth: 4 },
      cells: flower,
      essential: true,
    }),
    zone({
      id: "j2-tree-corner",
      jobId: "job-backyard-restoration",
      kind: "branch",
      name: "Tree Corner",
      cameraTarget: [-5.5, 1.3, -5],
      bounds: { x: -8, z: -7, width: 6, depth: 5 },
      cells: branches,
      essential: true,
    }),
  ];
}

export function createZonesForJob(jobId: string): WorkZone[] {
  if (jobId === "job-backyard-restoration") return createJob2Zones();
  return createJob1Zones();
}

export function cloneZones(zones: WorkZone[]): WorkZone[] {
  return zones.map((z) => ({
    ...z,
    cameraTarget: [...z.cameraTarget] as [number, number, number],
    bounds: { ...z.bounds },
    cells: z.cells.map((c) => ({
      ...c,
      damageKinds: [...c.damageKinds],
      tags: [...c.tags],
    })),
  }));
}

export function isZoneKind(k: string): k is ZoneKind {
  return [
    "lawn",
    "edge",
    "leaves",
    "hedge",
    "flowerbed",
    "branch",
    "litter",
  ].includes(k);
}
