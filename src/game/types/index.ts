/**
 * Shared domain contracts for YardShift 3D.
 * Feature modules and UI must import from here — do not duplicate these shapes.
 */

export type JobStatus = "available" | "accepted" | "in_progress" | "completed";

export type ToolCategory =
  | "cutting"
  | "digging"
  | "raking"
  | "watering"
  | "cleanup";

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
  status: JobStatus;
  difficulty: 1 | 2 | 3;
  estimatedMinutes: number;
  reward: Reward;
  requiredToolIds: string[];
}

export interface YardObject {
  id: string;
  kind: "debris" | "weed" | "leaf_pile" | "bush" | "tree" | "prop";
  label: string;
  position: [number, number, number];
  scale?: [number, number, number];
  cleaned: boolean;
  requiredToolCategory?: ToolCategory;
}

export interface Yard {
  id: string;
  name: string;
  width: number;
  depth: number;
  objects: YardObject[];
}

export interface GardeningTool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  /** Real-world educational note shown in UI */
  realWorldPurpose: string;
  purchasePrice: number;
  ownedByDefault: boolean;
}

export interface ToolInteractionResult {
  success: boolean;
  message: string;
  objectId?: string;
  rewardGranted?: Reward;
}

export interface GameProgress {
  activeJobId: string | null;
  selectedToolId: string | null;
  jobsCompleted: number;
  totalCreditsEarned: number;
  tutorialCompleted: boolean;
}
