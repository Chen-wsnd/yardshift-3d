import type { Job, JobStatus, Player } from "@/game/types";

const ACCEPTABLE_STATUSES: JobStatus[] = ["available"];

/**
 * Returns whether a player may accept a job.
 * Phase 0: status + owned required tools. No economy side-effects here.
 */
export function canAcceptJob(player: Player, job: Job): boolean {
  if (!ACCEPTABLE_STATUSES.includes(job.status)) {
    return false;
  }

  return job.requiredToolIds.every((toolId) =>
    player.ownedToolIds.includes(toolId),
  );
}

export function getAcceptJobBlockReason(
  player: Player,
  job: Job,
): string | null {
  if (!ACCEPTABLE_STATUSES.includes(job.status)) {
    return `Job is not available (status: ${job.status}).`;
  }

  const missing = job.requiredToolIds.filter(
    (toolId) => !player.ownedToolIds.includes(toolId),
  );

  if (missing.length > 0) {
    return `Missing required tools: ${missing.join(", ")}.`;
  }

  return null;
}

/** Credits awarded when a job is marked completed (pure helper). */
export function calculateJobPayout(job: Job): number {
  return job.reward.amount;
}
