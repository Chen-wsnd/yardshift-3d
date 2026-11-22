import type { WorkJobState, WorkZone } from "@/game/work/types";
import { JOB_BASE_PAYOUT } from "@/data/equipmentProfiles";

export function computeFinishedWorkPct(zones: WorkZone[]): number {
  const essential = zones.filter((z) => z.essential);
  const cells = essential.flatMap((z) =>
    z.cells.filter((c) => !c.isPile),
  );
  if (cells.length === 0) return 0;
  const done = cells.filter(
    (c) =>
      c.remainingWork <= 0 ||
      c.result === "finished" ||
      c.result === "bagged" ||
      c.result === "stubble" ||
      c.collected,
  ).length;
  // stubble counts as partial credit for flowerbed root jobs
  const weighted = cells.reduce((acc, c) => {
    if (c.collected || c.result === "bagged" || c.result === "finished")
      return acc + 1;
    if (c.result === "stubble") return acc + 0.35;
    if (c.remainingWork < 100) return acc + (100 - c.remainingWork) / 100;
    return acc;
  }, 0);
  void done;
  return Math.min(1, weighted / cells.length);
}

export function computeQualityScore(zones: WorkZone[]): number {
  const cells = zones.flatMap((z) => z.cells);
  if (cells.length === 0) return 100;
  let score = 100;
  for (const c of cells) {
    if (c.damageKinds.includes("flower_damaged")) score -= 8;
    if (c.damageKinds.includes("scalped")) score -= 6;
    if (c.damageKinds.includes("bark_damaged")) score -= 5;
    if (c.result === "uneven") score -= 2;
    if (c.result === "scattered") score -= 1;
  }
  return Math.max(0, Math.min(100, score));
}

export function updateJobMetrics(job: WorkJobState): WorkJobState {
  const finishedWorkPct = computeFinishedWorkPct(job.zones);
  const qualityScore = computeQualityScore(job.zones);
  return { ...job, finishedWorkPct, qualityScore };
}

export function canEarlyFinish(job: WorkJobState): boolean {
  return job.finishedWorkPct >= 0.7;
}

export function canFinishComplete(job: WorkJobState): boolean {
  return job.finishedWorkPct >= 0.999;
}

/** gross = round(base * (0.4+0.6*completion) * (0.55+0.45*quality/100)) */
export function computeGrossPayout(job: WorkJobState): number {
  const base = JOB_BASE_PAYOUT[job.jobId] ?? 0;
  const completion = job.finishedWorkPct;
  const quality = job.qualityScore;
  return Math.round(
    base * (0.4 + 0.6 * completion) * (0.55 + 0.45 * (quality / 100)),
  );
}

export function computeNetPayout(
  job: WorkJobState,
  fees: number,
): number {
  return Math.max(0, computeGrossPayout(job) - fees);
}
