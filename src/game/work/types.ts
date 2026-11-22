/** YardShift v0.2 work-system contracts */

export type CellResult =
  | "untouched"
  | "partial"
  | "finished"
  | "uneven"
  | "scalped"
  | "flower_damaged"
  | "bark_damaged"
  | "stubble"
  | "scattered"
  | "bagged"
  | "pending_treatment";

export type ToolStatus = "ready" | "unpowered" | "jammed" | "broken";

export type PowerSource =
  | "manual"
  | "battery"
  | "petrol"
  | "hand_pump"
  | "consumable";

export type ActionKind =
  | "cut"
  | "edge"
  | "shape"
  | "rake"
  | "blow"
  | "bag"
  | "pull"
  | "treat"
  | "clear_jam"
  | "service"
  | "repair"
  | "refill"
  | "recharge"
  | "inspect";

export type ZoneKind =
  | "lawn"
  | "edge"
  | "leaves"
  | "hedge"
  | "flowerbed"
  | "branch"
  | "litter";

export interface WorkCell {
  id: string;
  zoneId: string;
  localX: number;
  localZ: number;
  remainingWork: number;
  result: CellResult;
  damageKinds: string[];
  collected: boolean;
  /** Visible hazard tags for deterministic faults */
  tags: string[];
  /** Protected flower / bark markers */
  protectedKind?: "flower" | "bark" | null;
  /** Leaf pile aggregation marker */
  isPile?: boolean;
}

export interface WorkZone {
  id: string;
  jobId: string;
  kind: ZoneKind;
  name: string;
  cameraTarget: [number, number, number];
  bounds: { x: number; z: number; width: number; depth: number };
  cells: WorkCell[];
  essential: boolean;
}

export interface ToolInstance {
  id: string;
  power: PowerSource;
  status: ToolStatus;
  condition: number;
  resourceType: "none" | "fuel" | "battery" | "fluid";
  resource: number;
  jamEventIds: string[];
}

export interface ToolProfile {
  id: string;
  name: string;
  emoji: string;
  description: string;
  compatibleZoneKinds: ZoneKind[];
  actionKind: ActionKind;
  coverageRadius: number;
  workPerStroke: number;
  maxCellsPerStroke: number;
  precision: number;
  wearPerStroke: number;
  purchaseCredits: number;
  rentalCredits: number;
  ownedByDefault: boolean;
  power: PowerSource;
  resourceType: "none" | "fuel" | "battery" | "fluid";
  /** Legacy ID alias for board/shop continuity */
  legacyId?: string;
}

export interface WorkAction {
  jobId: string;
  zoneId: string;
  toolId: string;
  action: ActionKind;
  worldX: number;
  worldZ: number;
  strokeId: string;
  direction?: [number, number];
}

export interface WorkEvent {
  id: string;
  kind:
    | "progress"
    | "ineffective"
    | "jammed"
    | "broken"
    | "not_powered"
    | "scattered"
    | "environment_damaged"
    | "repaired"
    | "refilled"
    | "bagged"
    | "stubble";
  zoneId: string;
  toolId: string;
  cellId?: string;
  qualityDelta?: number;
  costCredits?: number;
  explanation: string;
  damageKey?: string;
}

export interface LedgerEntry {
  id: string;
  kind: "rental" | "repair" | "refill" | "damage" | "payout";
  jobId: string | null;
  amount: number;
  label: string;
}

export interface WorkJobState {
  jobId: string;
  zones: WorkZone[];
  finishedWorkPct: number;
  qualityScore: number;
  workActions: number;
  claimed: boolean;
  settled: boolean;
  netCredits: number;
  earlyFinish: boolean;
}

export interface WorkSnapshot {
  schemaVersion: 2;
  balance: number;
  ownedToolIds: string[];
  rentedToolIds: string[];
  tools: Record<string, ToolInstance>;
  jobs: Record<string, WorkJobState>;
  activeJobId: string | null;
  focusedZoneId: string | null;
  selectedToolId: string | null;
  ledger: LedgerEntry[];
  damageKeys: string[];
  lastEvents: WorkEvent[];
  demoStarted: boolean;
}
