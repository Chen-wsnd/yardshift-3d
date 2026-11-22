/** Cross-task garden domain — thin slice beside WorkSnapshot lawn cells. */

export type DebrisState = "scattered" | "gathered" | "bagged" | "acceptable";

export interface WorldFootprint {
  x: number;
  z: number;
  radius: number;
  areaId?: string;
}

export type GardenEvent =
  | { id: string; type: "INSPECTED"; objectId: string; effort: number }
  | { id: string; type: "HAZARD_REMOVED"; hazardId: string; effort: number }
  | {
      id: string;
      type: "TOOL_SELECTED";
      toolId: string;
      previousToolId?: string;
      effort: number;
    }
  | { id: string; type: "TOOL_RECHARGED"; toolId: string; effort: number }
  | { id: string; type: "PLAN_REVISED"; orderedTaskIds: string[] }
  | {
      id: string;
      type: "WORK_PERFORMED";
      taskId: string;
      toolId: string;
      affectedIds: string[];
      effort: number;
      worldFootprint?: WorldFootprint;
    }
  | {
      id: string;
      type: "HEDGE_CLUSTER_CUT";
      clusterId: string;
      overcut?: boolean;
      effort: number;
      worldFootprint?: WorldFootprint;
    }
  | {
      id: string;
      type: "PLANT_ROOT_REMOVED";
      plantId: string;
      effort: number;
      worldFootprint?: WorldFootprint;
    }
  | {
      id: string;
      type: "PLANT_TOP_CUT";
      plantId: string;
      effort: number;
      worldFootprint?: WorldFootprint;
    }
  | {
      id: string;
      type: "DEBRIS_SPAWNED";
      debrisId: string;
      sourceActionId: string;
      x: number;
      z: number;
      kind: string;
    }
  | {
      id: string;
      type: "DEBRIS_MOVED";
      debrisId: string;
      x: number;
      z: number;
      worldFootprint?: WorldFootprint;
    }
  | {
      id: string;
      type: "DEBRIS_GATHERED";
      debrisIds: string[];
      worldFootprint?: WorldFootprint;
      effort?: number;
      isRework?: boolean;
    }
  | {
      id: string;
      type: "DEBRIS_BAGGED";
      debrisIds: string[];
      worldFootprint?: WorldFootprint;
      effort?: number;
      isRework?: boolean;
    }
  | {
      id: string;
      type: "EDGE_WORKED";
      segmentIds: string[];
      toolId: string;
      effort: number;
      worldFootprint?: WorldFootprint;
    }
  | {
      id: string;
      type: "ENVIRONMENT_DAMAGED";
      targetId: string;
      damageKind: string;
    }
  | {
      id: string;
      type: "VISIT_FINISHED";
      summaryNote?: string;
    };

export interface HedgeCluster {
  id: string;
  x: number;
  z: number;
  cut: boolean;
  overcut: boolean;
}

export interface PlantEntity {
  id: string;
  kind: "weed" | "flower";
  x: number;
  z: number;
  topCut: boolean;
  rootRemoved: boolean;
  ornamentalDamage: boolean;
}

export interface DebrisEntity {
  id: string;
  kind: string;
  x: number;
  z: number;
  state: DebrisState;
  sourceActionId?: string;
}

export interface HazardEntity {
  id: string;
  x: number;
  z: number;
  cleared: boolean;
  blocks: string[];
  label: string;
}

/** Independent edge authority — not lawn WorkCells. */
export interface EdgeSegment {
  id: string;
  x: number;
  z: number;
  remaining: number;
  finished: boolean;
}

export interface CleanupRecord {
  id: string;
  x: number;
  z: number;
  radius: number;
  atEventIndex: number;
  debrisIds: string[];
}

export interface EffortLedger {
  productive: number;
  setup: number;
  rework: number;
  ineffective: number;
  recovery: number;
}

export interface GardenDomain {
  /** 1 = original V06; 2 = edge + cleanup history + visit */
  schemaVersion: 1 | 2;
  inspection: Record<string, { observed: boolean; effort: number }>;
  hazards: Record<string, HazardEntity>;
  hedgeClusters: Record<string, HedgeCluster>;
  plants: Record<string, PlantEntity>;
  debris: Record<string, DebrisEntity>;
  edgeSegments: Record<string, EdgeSegment>;
  cleanupHistory: CleanupRecord[];
  plan: { taskOrder: string[]; revision: number };
  effort: EffortLedger;
  events: GardenEvent[];
  appliedEventIds: string[];
  activeTaskId: string | null;
  /** Debris cluster the player focused for cleanup camera */
  focusPoint: { x: number; z: number } | null;
  reviewOpen: boolean;
  visitFinished: boolean;
  lastVisitNote: string | null;
}

export type GardenTaskId =
  | "lawn"
  | "hedge"
  | "edge"
  | "flowerbed"
  | "debris"
  | "hazard";
