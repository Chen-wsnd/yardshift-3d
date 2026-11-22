import type {
  Job,
  JobProgress,
  JobStatus,
  Player,
  YardObject,
} from "@/game/types";

/**
 * Returns whether a player may accept a job (status + unlock only).
 * Tool ownership for Job 2 is handled via shop + demo loaners.
 */
export function canAcceptJob(
  player: Player,
  job: Job,
  claimedRewardJobIds: string[],
): boolean {
  if (job.status !== "available") {
    return false;
  }
  return isJobUnlocked(job, claimedRewardJobIds);
}

export function isJobUnlocked(
  job: Job,
  claimedRewardJobIds: string[],
): boolean {
  if (!job.unlockAfterJobId) {
    return true;
  }
  return claimedRewardJobIds.includes(job.unlockAfterJobId);
}

export function getAcceptJobBlockReason(
  player: Player,
  job: Job,
  claimedRewardJobIds: string[],
): string | null {
  if (job.status === "locked" || !isJobUnlocked(job, claimedRewardJobIds)) {
    return "Complete and claim the previous job reward to unlock this contract.";
  }
  if (job.status === "completed") {
    return "Job already completed. Use Reset Demo to replay.";
  }
  if (job.status !== "available") {
    return `Job is not available (status: ${job.status}).`;
  }
  void player;
  return null;
}

export function calculateJobPayout(job: Job): number {
  return job.reward.amount;
}

export function getJobProgress(
  jobId: string,
  objects: YardObject[],
  objectiveIds: string[],
): JobProgress {
  const required = objects.filter(
    (o) => o.isObjective && objectiveIds.includes(o.id),
  );
  const cleanedCount = required.filter(
    (o) => o.cleaned || o.interactionState === "cleaned",
  ).length;
  const totalRequired = required.length;
  const complete = totalRequired > 0 && cleanedCount >= totalRequired;

  return {
    jobId,
    cleanedCount,
    totalRequired,
    complete,
    percent:
      totalRequired === 0 ? 0 : Math.round((cleanedCount / totalRequired) * 100),
  };
}

/** Decorative objects never count toward completion. */
export function countScoreableObjectives(objects: YardObject[]): number {
  return objects.filter((o) => o.isObjective && o.targetKind !== "decorative")
    .length;
}

export function deriveDisplayStatus(
  job: Job,
  claimedRewardJobIds: string[],
): JobStatus {
  if (claimedRewardJobIds.includes(job.id) || job.status === "completed") {
    return "completed";
  }
  if (!isJobUnlocked(job, claimedRewardJobIds)) {
    return "locked";
  }
  return job.status === "locked" ? "available" : job.status;
}
