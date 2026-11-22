/** Cross-task garden domain — thin slice beside WorkSnapshot lawn cells. */

export type DebrisState = "scattered" | "gathered" | "bagged" | "acceptable";

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
    }
  | {
      id: string;
      type: "HEDGE_CLUSTER_CUT";
      clusterId: string;
      overcut?: boolean;
      effort: number;
    }
  | { id: string; type: "PLANT_ROOT_REMOVED"; plantId: string; effort: number }
  | { id: string; type: "PLANT_TOP_CUT"; plantId: string; effort: number }
  | {
      id: string;
      type: "DEBRIS_SPAWNED";
      debrisId: string;
      sourceActionId: string;
      x: number;
      z: number;
      kind: string;
    }
  | { id: string; type: "DEBRIS_MOVED"; debrisId: string; x: number; z: number }
  | { id: string; type: "DEBRIS_GATHERED"; debrisIds: string[] }
  | { id: string; type: "DEBRIS_BAGGED"; debrisIds: string[] }
  | {
      id: string;
      type: "ENVIRONMENT_DAMAGED";
      targetId: string;
      damageKind: string;
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

export interface EffortLedger {
  productive: number;
  setup: number;
  rework: number;
  ineffective: number;
  recovery: number;
}

export interface GardenDomain {
  schemaVersion: 1;
  inspection: Record<string, { observed: boolean; effort: number }>;
  hazards: Record<string, HazardEntity>;
  hedgeClusters: Record<string, HedgeCluster>;
  plants: Record<string, PlantEntity>;
  debris: Record<string, DebrisEntity>;
  plan: { taskOrder: string[]; revision: number };
  effort: EffortLedger;
  events: GardenEvent[];
  appliedEventIds: string[];
  activeTaskId: string | null;
  reviewOpen: boolean;
}

export type GardenTaskId =
  | "lawn"
  | "hedge"
  | "edge"
  | "flowerbed"
  | "debris"
  | "hazard";
