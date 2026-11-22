"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { RentalControls } from "@/features/economy/RentalControls";
import { WorkbenchPanel } from "@/features/economy/WorkbenchPanel";
import { useGameStore } from "@/game/store/gameStore";
import { JOB_BASE_PAYOUT } from "@/data/equipmentProfiles";

const JOB_COPY = {
  "job-overgrown-lawn": {
    title: "Maple Lane — Weekly Lawn Care",
    description:
      "Sunlit weekly maintenance: mow the lawn, tidy path edges, gather leaves, clear fence-line weeds. Manual tools can finish the job; rentals speed it up.",
  },
  "job-backyard-restoration": {
    title: "Willow House — Backyard Restoration",
    description:
      "Distinct restoration yard: patio debris, long hedge by the flowerbed, tree-corner branches. Power helps but hand tools still work — mistakes leave lasting damage.",
  },
} as const;

export function JobBoard() {
  const work = useGameStore((s) => s.work);
  const startV02Demo = useGameStore((s) => s.startV02Demo);
  const resetDemo = useGameStore((s) => s.resetDemo);
  const acceptJob = useGameStore((s) => s.acceptJob);
  const isJobUnlocked = useGameStore((s) => s.isJobUnlocked);
  const feedback = work.lastEvents[0]?.explanation;

  return (
    <section aria-labelledby="task-board-heading">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            id="task-board-heading"
            className="font-[family-name:var(--font-display)] text-3xl text-emerald-950 sm:text-4xl"
          >
            Task Board
          </h1>
          <p className="mt-2 max-w-prose text-stone-600">
            YardShift v0.2 — work zones, durable tools, and lasting consequences.
            Credits are fictional.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              if (
                window.confirm(
                  "Start a fresh v0.2 demo? Clears v0.2 progress (v0.1 save untouched).",
                )
              ) {
                startV02Demo();
              }
            }}
          >
            Start v0.2 Demo
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              if (window.confirm("Reset v0.2 demo progress?")) resetDemo();
            }}
          >
            Reset Demo
          </Button>
        </div>
      </div>

      {feedback ? (
        <p
          className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          {feedback}
        </p>
      ) : null}

      <div className="mt-4 divide-y divide-stone-200">
        {(
          ["job-overgrown-lawn", "job-backyard-restoration"] as const
        ).map((jobId) => {
          const job = work.jobs[jobId];
          const copy = JOB_COPY[jobId];
          const unlocked = isJobUnlocked(jobId);
          const claimed = job?.claimed;
          const active = work.activeJobId === jobId;
          return (
            <article key={jobId} className="py-6">
              <div className="mb-2 flex flex-wrap items-baseline gap-3">
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
                  {copy.title}
                </h2>
                <span className="text-xs uppercase tracking-wide text-stone-500">
                  {claimed
                    ? "completed"
                    : active
                      ? "in progress"
                      : unlocked
                        ? "available"
                        : "locked"}
                </span>
              </div>
              <p className="mb-3 max-w-prose text-stone-600">{copy.description}</p>
              <p className="text-sm text-stone-700">
                Base fee {JOB_BASE_PAYOUT[jobId]} credits
                {job
                  ? ` · ${Math.round(job.finishedWorkPct * 100)}% work · quality ${Math.round(job.qualityScore)}`
                  : ""}
                {claimed ? ` · paid ${job.netCredits}` : ""}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {unlocked && !claimed && !active ? (
                  <Button onClick={() => acceptJob(jobId)}>Accept Job</Button>
                ) : null}
                {active ? (
                  <Link
                    href="/yard"
                    className="inline-flex items-center justify-center rounded-md bg-amber-100 px-4 py-2 text-sm font-medium text-amber-950 hover:bg-amber-200"
                  >
                    Enter Yard
                  </Link>
                ) : null}
                {!unlocked ? (
                  <p className="text-sm text-amber-800">
                    Claim Job 1 payout to unlock.
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <section className="border-t border-stone-200 pt-8">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          Rentals & Shop
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          No free advanced loaners. Manual starters can finish both jobs.
        </p>
        <div className="mt-4">
          <RentalControls />
        </div>
      </section>

      <WorkbenchPanel />
    </section>
  );
}
