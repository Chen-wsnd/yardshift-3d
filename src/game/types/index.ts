/**
 * Shared domain contracts for YardShift 3D v0.1.
 * Feature modules and UI import from here — do not duplicate these shapes.
 */

export type JobStatus =
  | "locked"
  | "available"
  | "accepted"
  | "in_progress"
  | "completed";

export type ToolCategory =
  | "cutting"
  | "digging"
  | "raking"
  | "watering"
  | "cleanup"
  | "mowing"
  | "edging"
  | "blowing"
  | "chemical";

/** Interactive cleanup kinds used by the tool engine. */
export type TargetKind =
  | "leaves"
  | "weeds"
  | "tall_edge_grass"
  | "long_lawn"
  | "lawn_edge"
  | "hedge"
  | "fallen_branch"
  | "decorative";

export type ObjectInteractionState = "dirty" | "cleaned" | "decorative";

export type ToolAvailability = "owned" | "loaned" | "locked" | "available_for_purchase";

export interface Player {
  id: string;
  displayName: string;
  balance: number;
  ownedToolIds: string[];
  completedJobIds: string[];
}

export interface Reward {
  id: string;
  label: string;
  amount: number;
  currency: "credits";
}

export interface Job {
  id: string;
  title: string;
  description: string;
  yardId: string;
  layoutId: string;
  status: JobStatus;
  difficulty: 1 | 2 | 3;
  estimatedMinutes: number;
  reward: Reward;
  /** Tools recommended / needed; ownership enforced via unlock + loaners. */
  requiredToolIds: string[];
  objectiveIds: string[];
  /** Job that must have claimed reward before this unlocks. */
  unlockAfterJobId?: string;
}

export interface YardObject {
  id: string;
  kind: "debris" | "weed" | "leaf_pile" | "bush" | "tree" | "prop" | "lawn" | "edge" | "branch";
  label: string;
  position: [number, number, number];
  scale?: [number, number, number];
  cleaned: boolean;
  /** @deprecated Prefer targetKind + evaluateToolUse; kept for migration. */
  requiredToolCategory?: ToolCategory;
  targetKind: TargetKind;
  isObjective: boolean;
  interactionState: ObjectInteractionState;
  recommendedToolId?: string;
}

export interface Yard {
  id: string;
  name: string;
  width: number;
  depth: number;
  objects: YardObject[];
}

export interface YardLayout {
  id: string;
  yardId: string;
  jobId: string;
  name: string;
  objects: YardObject[];
}

export interface GardeningTool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  realWorldPurpose: string;
  purchasePrice: number;
  ownedByDefault: boolean;
  compatibleTargets: TargetKind[];
  visualEffect: string;
  emoji: string;
}

export type ToolEffectType =
  | "shrink_fade"
  | "shorten_fade"
  | "neaten_lawn"
  | "clean_edge"
  | "disperse_fade"
  | "shape_hedge"
  | "cut_branch"
  | "fade_weeds"
  | "none";

export interface ToolInteractionResult {
  success: boolean;
  message: string;
  objectId?: string;
  effectType?: ToolEffectType;
  rewardGranted?: Reward;
}

export interface GameProgress {
  activeJobId: string | null;
  selectedToolId: string | null;
  jobsCompleted: number;
  totalCreditsEarned: number;
  tutorialCompleted: boolean;
  claimedRewardJobIds: string[];
  /** Temporary tools granted for the active job (not permanent ownership). */
  loanedToolIds: string[];
  lastFeedback: string | null;
  showCompletionModal: boolean;
}

export interface JobProgress {
  jobId: string;
  cleanedCount: number;
  totalRequired: number;
  complete: boolean;
  percent: number;
}
