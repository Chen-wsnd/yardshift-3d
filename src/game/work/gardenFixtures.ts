import { EQUIPMENT_PROFILES, STARTER_TOOL_IDS } from "@/data/equipmentProfiles";
import { cloneZones, createZonesForJob } from "@/data/workZones";
import {
  LAWN_FINE,
  LAWN_ZONE_ID,
  isFlowerBorderCol,
  lawnCellCenter,
} from "@/data/lawnGrid";
import { makeToolInstance } from "./fixtures";
import type { ToolInstance, WorkCell, WorkSnapshot, WorkZone } from "./types";

const GARDEN_JOB_ID = "job-overgrown-lawn";

/** Fine lawn patches — sole authoritative mow state for P0. */
export function createFineLawnZone(jobId: string): WorkZone {
  const cells: WorkCell[] = [];
  for (let r = 0; r < LAWN_FINE.rows; r++) {
    for (let c = 0; c < LAWN_FINE.cols; c++) {
      const { x, z } = lawnCellCenter(c, r);
      const flower = isFlowerBorderCol(c);
      cells.push({
        id: `${LAWN_ZONE_ID}-c${c}-r${r}`,
        zoneId: LAWN_ZONE_ID,
        localX: x,
        localZ: z,
        remainingWork: 100,
        result: "untouched",
        damageKinds: [],
        collected: false,
        tags: flower ? ["protected_flower", "flower_border"] : ["lawn"],
        protectedKind: flower ? "flower" : null,
      });
    }
  }
  return {
    id: LAWN_ZONE_ID,
    jobId,
    kind: "lawn",
    name: "Front Lawn",
    cameraTarget: [0, 1, 0],
    bounds: {
      x: LAWN_FINE.originX,
      z: LAWN_FINE.originZ,
      width: LAWN_FINE.width,
      depth: LAWN_FINE.depth,
    },
    cells,
    essential: true,
  };
}

/**
 * v0.3/P0 garden path — fine lawn + powered mower owned (no rental UI).
 * Persist key remains `yardshift-v03`; fine grid replaces coarse 16 cells on fresh start.
 */
export function createFreshV03GardenSnapshot(): WorkSnapshot {
  const tools: Record<string, ToolInstance> = {};
  for (const p of EQUIPMENT_PROFILES) {
    tools[p.id] = makeToolInstance(p.id);
  }

  const fineLawn = createFineLawnZone(GARDEN_JOB_ID);
  // Keep other Job-1 zones for engine compat, but UI only exposes lawn
  const legacy = cloneZones(createZonesForJob(GARDEN_JOB_ID)).filter(
    (z) => z.id !== LAWN_ZONE_ID,
  );

  return {
    schemaVersion: 3,
    balance: 0,
    ownedToolIds: [...STARTER_TOOL_IDS, "lawn-mower"],
    rentedToolIds: [],
    tools,
    jobs: {
      [GARDEN_JOB_ID]: {
        jobId: GARDEN_JOB_ID,
        zones: [fineLawn, ...legacy],
        finishedWorkPct: 0,
        qualityScore: 100,
        workActions: 0,
        claimed: false,
        settled: false,
        netCredits: 0,
        earlyFinish: false,
      },
      "job-backyard-restoration": {
        jobId: "job-backyard-restoration",
        zones: cloneZones(createZonesForJob("job-backyard-restoration")),
        finishedWorkPct: 0,
        qualityScore: 100,
        workActions: 0,
        claimed: false,
        settled: false,
        netCredits: 0,
        earlyFinish: false,
      },
    },
    activeJobId: GARDEN_JOB_ID,
    focusedZoneId: null,
    selectedToolId: "manual-reel-mower",
    ledger: [],
    damageKeys: [],
    lastEvents: [
      {
        id: "garden-start",
        kind: "progress",
        zoneId: "",
        toolId: "",
        explanation:
          "Drag a reel or powered mower across the lawn. Still clicks do nothing.",
      },
    ],
    demoStarted: true,
  };
}

export const V03_GARDEN_JOB_ID = GARDEN_JOB_ID;

/** If an older v03 save still has the coarse 16-cell lawn, rebuild fine grid once. */
export function migrateLawnIfNeeded(snap: WorkSnapshot): WorkSnapshot {
  const job = snap.jobs[GARDEN_JOB_ID];
  if (!job) return snap;
  const lawn = job.zones.find((z) => z.id === LAWN_ZONE_ID);
  const expected = LAWN_FINE.cols * LAWN_FINE.rows;
  if (lawn && lawn.cells.length === expected) return snap;
  const fine = createFineLawnZone(GARDEN_JOB_ID);
  return {
    ...snap,
    jobs: {
      ...snap.jobs,
      [GARDEN_JOB_ID]: {
        ...job,
        zones: [fine, ...job.zones.filter((z) => z.id !== LAWN_ZONE_ID)],
      },
    },
  };
}
