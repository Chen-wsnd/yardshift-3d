"use client";

import { getJobProgress } from "@/game/rules/jobRules";
import { useGameStore } from "@/game/store/gameStore";

export function YardHud() {
  const feedback = useGameStore((s) => s.progress.lastFeedback);
  const activeJobId = useGameStore((s) => s.progress.activeJobId);
  const jobs = useGameStore((s) => s.jobs);
  const yardObjects = useGameStore((s) => s.yard.objects);
  const job = jobs.find((j) => j.id === activeJobId);
  const progress = job
    ? getJobProgress(job.id, yardObjects, job.objectiveIds)
    : null;
  const objectives = yardObjects.filter((o) => o.isObjective);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-3 sm:p-4">
      <div className="pointer-events-auto max-w-md rounded-md border border-stone-200/80 bg-white/90 p-3 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <p className="font-[family-name:var(--font-display)] text-sm text-stone-900">
            Objectives
          </p>
          {progress ? (
            <p className="text-xs font-semibold tabular-nums text-emerald-800">
              {progress.cleanedCount}/{progress.totalRequired}
            </p>
          ) : null}
        </div>
        {progress ? (
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        ) : (
          <p className="mt-1 text-xs text-stone-500">
            Accept a job from the task board to load objectives.
          </p>
        )}
        {job ? (
          <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs text-stone-600">
            {objectives.map((o) => (
              <li
                key={o.id}
                className={
                  o.cleaned || o.interactionState === "cleaned"
                    ? "text-stone-400 line-through"
                    : ""
                }
              >
                {o.label}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {feedback ? (
        <div
          className="pointer-events-auto max-w-md rounded-md border border-emerald-200 bg-emerald-50/95 px-3 py-2 text-sm text-emerald-950 shadow-sm"
          role="status"
        >
          {feedback}
        </div>
      ) : null}
    </div>
  );
}
