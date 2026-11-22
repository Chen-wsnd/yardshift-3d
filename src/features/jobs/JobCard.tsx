"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { canAcceptJob, getAcceptJobBlockReason } from "@/game/rules/jobRules";
import { useGameStore } from "@/game/store/gameStore";
import type { Job } from "@/game/types";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const player = useGameStore((state) => state.player);
  const acceptJob = useGameStore((state) => state.acceptJob);
  const enterYardForActiveJob = useGameStore((state) => state.enterYardForActiveJob);

  const canAccept = canAcceptJob(player, job);
  const blockReason = getAcceptJobBlockReason(player, job);
  const isAccepted =
    job.status === "accepted" || job.status === "in_progress";

  return (
    <article className="max-w-xl border-b border-stone-200 py-6">
      <div className="mb-2 flex flex-wrap items-baseline gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {job.title}
        </h2>
        <span className="text-xs uppercase tracking-wide text-stone-500">
          {job.status.replace("_", " ")}
        </span>
      </div>
      <p className="mb-4 max-w-prose text-stone-600">{job.description}</p>
      <dl className="mb-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-stone-700 sm:grid-cols-3">
        <div>
          <dt className="text-stone-500">Reward</dt>
          <dd className="font-medium">{job.reward.amount} credits</dd>
        </div>
        <div>
          <dt className="text-stone-500">Difficulty</dt>
          <dd className="font-medium">{"★".repeat(job.difficulty)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Est. time</dt>
          <dd className="font-medium">{job.estimatedMinutes} min</dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center gap-3">
        {job.status === "available" ? (
          <Button
            onClick={() => acceptJob(job.id)}
            disabled={!canAccept}
            title={blockReason ?? undefined}
          >
            Accept Job
          </Button>
        ) : null}
        {isAccepted ? (
          <Link
            href="/yard"
            onClick={() => {
              enterYardForActiveJob();
            }}
            className="inline-flex items-center justify-center rounded-md bg-amber-100 px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            Enter Yard
          </Link>
        ) : null}
        {!canAccept && job.status === "available" && blockReason ? (
          <p className="text-sm text-amber-800">{blockReason}</p>
        ) : null}
      </div>
    </article>
  );
}
