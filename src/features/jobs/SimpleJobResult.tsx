"use client";

import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/game/store/gameStore";

export function SimpleJobResult() {
  const work = useGameStore((s) => s.work);
  const finishJob = useGameStore((s) => s.finishJob);
  const jobId = work.activeJobId;
  const job = jobId ? work.jobs[jobId] : null;
  if (!job || !jobId) return null;

  const pct = Math.round(job.finishedWorkPct * 100);

  return (
    <div className="rounded-md border border-stone-200 bg-white/90 p-3 text-sm shadow-sm">
      <p className="font-medium text-stone-900">
        Progress {pct}% · Quality {Math.round(job.qualityScore)}
      </p>
      <p className="mt-1 text-xs text-stone-500">
        Finish at 100%, or early from 70% with reduced pay. Damage persists this
        contract.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          onClick={() => finishJob(false)}
          disabled={job.finishedWorkPct < 0.999}
        >
          Finish & Review
        </Button>
        <Button
          variant="secondary"
          onClick={() => finishJob(true)}
          disabled={job.finishedWorkPct < 0.7}
        >
          Finish Early
        </Button>
      </div>
    </div>
  );
}
