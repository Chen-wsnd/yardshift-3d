"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  deriveDisplayStatus,
  getAcceptJobBlockReason,
} from "@/game/rules/jobRules";
import { useGameStore } from "@/game/store/gameStore";
import type { Job } from "@/game/types";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const player = useGameStore((state) => state.player);
  const claimed = useGameStore((state) => state.progress.claimedRewardJobIds);
  const acceptJob = useGameStore((state) => state.acceptJob);
  const enterActiveJob = useGameStore((state) => state.enterActiveJob);
  const activeJobId = useGameStore((state) => state.progress.activeJobId);

  const displayStatus = deriveDisplayStatus(job, claimed);
  const blockReason = getAcceptJobBlockReason(player, job, claimed);
  const canAccept = displayStatus === "available";
  const isActive =
    job.status === "accepted" ||
    job.status === "in_progress" ||
    activeJobId === job.id;
  const isDone = displayStatus === "completed";

  return (
    <article className="max-w-xl border-b border-stone-200 py-6">
      <div className="mb-2 flex flex-wrap items-baseline gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {job.title}
        </h2>
        <span className="text-xs uppercase tracking-wide text-stone-500">
          {displayStatus.replace("_", " ")}
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
          <dt className="text-stone-500">Targets</dt>
          <dd className="font-medium">{job.objectiveIds.length} required</dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center gap-3">
        {canAccept ? (
          <Button
            onClick={() => acceptJob(job.id)}
            title={blockReason ?? undefined}
          >
            Accept Job
          </Button>
        ) : null}
        {isActive && !isDone ? (
          <Link
            href="/yard"
            onClick={() => {
              enterActiveJob();
            }}
            className="inline-flex items-center justify-center rounded-md bg-amber-100 px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            Enter Yard
          </Link>
        ) : null}
        {isDone ? (
          <span className="text-sm font-medium text-emerald-800">
            Reward claimed
          </span>
        ) : null}
        {displayStatus === "locked" && blockReason ? (
          <p className="text-sm text-amber-800">{blockReason}</p>
        ) : null}
      </div>
    </article>
  );
}
