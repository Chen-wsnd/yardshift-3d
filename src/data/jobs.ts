import type { Job } from "@/game/types";
import { LAYOUT_BACKYARD_RESTORATION, LAYOUT_OVERGROWN_LAWN } from "./layouts";

export const JOBS: Job[] = [
  {
    id: "job-overgrown-lawn",
    title: "Overgrown Lawn",
    description:
      "Mow long patches, tidy edges, trim weeds, and clear scattered leaves before the weekend.",
    yardId: "yard-maple-lane",
    layoutId: LAYOUT_OVERGROWN_LAWN.id,
    status: "available",
    difficulty: 1,
    estimatedMinutes: 1,
    reward: {
      id: "reward-overgrown-lawn",
      label: "Lawn cleanup bonus",
      amount: 500,
      currency: "credits",
    },
    requiredToolIds: ["rake", "string-trimmer", "lawn-mower", "lawn-edger"],
    objectiveIds: LAYOUT_OVERGROWN_LAWN.objects
      .filter((o) => o.isObjective)
      .map((o) => o.id),
  },
  {
    id: "job-backyard-restoration",
    title: "Backyard Restoration",
    description:
      "Clear leaf piles, shape hedges, remove a fallen branch, and treat stubborn weeds.",
    yardId: "yard-maple-lane",
    layoutId: LAYOUT_BACKYARD_RESTORATION.id,
    status: "locked",
    difficulty: 2,
    estimatedMinutes: 1,
    reward: {
      id: "reward-backyard-restoration",
      label: "Restoration bonus",
      amount: 350,
      currency: "credits",
    },
    requiredToolIds: [
      "rake",
      "leaf-blower",
      "hedge-trimmer",
      "chainsaw",
      "herbicide",
      "string-trimmer",
    ],
    objectiveIds: LAYOUT_BACKYARD_RESTORATION.objects
      .filter((o) => o.isObjective)
      .map((o) => o.id),
    unlockAfterJobId: "job-overgrown-lawn",
  },
];

/** @deprecated Use JOBS */
export const SAMPLE_JOBS = JOBS;

export function getJobById(id: string): Job | undefined {
  return JOBS.find((job) => job.id === id);
}

/** Tools loaned for Job 2 if the player has not purchased them yet. */
export const JOB2_LOANER_TOOL_IDS = [
  "leaf-blower",
  "hedge-trimmer",
  "chainsaw",
  "herbicide",
] as const;
