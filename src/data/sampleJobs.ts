import type { Job } from "@/game/types";

export const SAMPLE_JOBS: Job[] = [
  {
    id: "job-maple-cleanup",
    title: "Maple Lane Leaf Cleanup",
    description:
      "Clear fallen leaves, trim the side bush, and tidy light debris before the weekend gathering.",
    yardId: "yard-maple-lane",
    status: "available",
    difficulty: 1,
    estimatedMinutes: 15,
    reward: {
      id: "reward-maple-cleanup",
      label: "Cleanup bonus",
      amount: 80,
      currency: "credits",
    },
    requiredToolIds: ["tool-rake", "tool-shears"],
  },
];

export function getJobById(id: string): Job | undefined {
  return SAMPLE_JOBS.find((job) => job.id === id);
}
