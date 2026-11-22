import type { WorkSnapshot, WorkZone } from "./types";
import { canEarlyFinish, canFinishComplete } from "@/game/rules/qualityRules";

export function getActiveJob(snap: WorkSnapshot) {
  if (!snap.activeJobId) return null;
  return snap.jobs[snap.activeJobId] ?? null;
}

export function getFocusedZone(snap: WorkSnapshot): WorkZone | null {
  const job = getActiveJob(snap);
  if (!job || !snap.focusedZoneId) return null;
  return job.zones.find((z) => z.id === snap.focusedZoneId) ?? null;
}

export function jobProgressLabel(snap: WorkSnapshot, jobId: string): string {
  const job = snap.jobs[jobId];
  if (!job) return "—";
  return `${Math.round(job.finishedWorkPct * 100)}% work · quality ${Math.round(job.qualityScore)}`;
}

export function finishOptions(snap: WorkSnapshot) {
  const job = getActiveJob(snap);
  if (!job) return { early: false, complete: false };
  return {
    early: canEarlyFinish(job),
    complete: canFinishComplete(job),
  };
}

export function feesForJob(snap: WorkSnapshot, jobId: string): number {
  return snap.ledger
    .filter(
      (e) =>
        e.jobId === jobId &&
        (e.kind === "rental" || e.kind === "repair" || e.kind === "refill" || e.kind === "damage"),
    )
    .reduce((s, e) => s + e.amount, 0);
}
