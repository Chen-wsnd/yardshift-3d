import { EQUIPMENT_PROFILES, STARTER_TOOL_IDS } from "@/data/equipmentProfiles";
import { cloneZones, createZonesForJob } from "@/data/workZones";
import type { ToolInstance, WorkJobState, WorkSnapshot } from "./types";

export function makeToolInstance(id: string): ToolInstance {
  const p = EQUIPMENT_PROFILES.find((x) => x.id === id)!;
  return {
    id,
    power: p.power,
    status: "ready",
    condition: 100,
    resourceType: p.resourceType,
    resource: p.resourceType === "none" ? 100 : 100,
    jamEventIds: [],
  };
}

export function makeJobState(jobId: string): WorkJobState {
  return {
    jobId,
    zones: cloneZones(createZonesForJob(jobId)),
    finishedWorkPct: 0,
    qualityScore: 100,
    workActions: 0,
    claimed: false,
    settled: false,
    netCredits: 0,
    earlyFinish: false,
  };
}

export function createFreshV02Snapshot(): WorkSnapshot {
  const tools: Record<string, ToolInstance> = {};
  for (const p of EQUIPMENT_PROFILES) {
    tools[p.id] = makeToolInstance(p.id);
  }
  return {
    schemaVersion: 2,
    balance: 40,
    ownedToolIds: [...STARTER_TOOL_IDS],
    rentedToolIds: [],
    tools,
    jobs: {
      "job-overgrown-lawn": makeJobState("job-overgrown-lawn"),
      "job-backyard-restoration": makeJobState("job-backyard-restoration"),
    },
    activeJobId: null,
    focusedZoneId: null,
    selectedToolId: "manual-reel-mower",
    ledger: [],
    damageKeys: [],
    lastEvents: [],
    demoStarted: true,
  };
}
