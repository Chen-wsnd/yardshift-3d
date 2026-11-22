import { EQUIPMENT_PROFILES, STARTER_TOOL_IDS } from "@/data/equipmentProfiles";
import { cloneZones, createZonesForJob } from "@/data/workZones";
import { makeToolInstance } from "./fixtures";
import type { ToolInstance, WorkSnapshot } from "./types";

const GARDEN_JOB_ID = "job-overgrown-lawn";

/** Mark a flower border on the lawn so careless powered passes can damage plants. */
function withLawnFlowerBorder(zones: ReturnType<typeof createZonesForJob>) {
  return zones.map((z) => {
    if (z.id !== "j1-lawn") return z;
    return {
      ...z,
      cells: z.cells.map((c, idx) => {
        // Rightmost column cells act as planted border
        const isBorder = c.localX >= 1.5;
        if (!isBorder) return c;
        return {
          ...c,
          protectedKind: "flower" as const,
          tags: [...new Set([...c.tags, "protected_flower", "flower_border"])],
          // Keep a couple as pure grass for clean passes
          ...(idx % 3 === 0
            ? {}
            : {
                protectedKind: "flower" as const,
              }),
        };
      }),
    };
  });
}

/**
 * v0.3 garden primary path — one residence, lawn vertical slice.
 * Reuses v0.2 work-cell engine; grants powered mower without rental UI.
 * Leaves `yardshift-v02` localStorage key untouched (separate persist key).
 */
export function createFreshV03GardenSnapshot(): WorkSnapshot {
  const tools: Record<string, ToolInstance> = {};
  for (const p of EQUIPMENT_PROFILES) {
    tools[p.id] = makeToolInstance(p.id);
  }

  const zones = withLawnFlowerBorder(cloneZones(createZonesForJob(GARDEN_JOB_ID)));

  return {
    schemaVersion: 3,
    balance: 0,
    ownedToolIds: [...STARTER_TOOL_IDS, "lawn-mower"],
    rentedToolIds: [],
    tools,
    jobs: {
      [GARDEN_JOB_ID]: {
        jobId: GARDEN_JOB_ID,
        zones,
        finishedWorkPct: 0,
        qualityScore: 100,
        workActions: 0,
        claimed: false,
        settled: false,
        netCredits: 0,
        earlyFinish: false,
      },
      // Retained for backwards compatibility; hidden from garden UI
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
          "One garden. Click the lawn, confirm, then push a real mower across the grass.",
      },
    ],
    demoStarted: true,
  };
}

export const V03_GARDEN_JOB_ID = GARDEN_JOB_ID;
