"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/game/store/gameStore";

export function CompletionModal() {
  const show = useGameStore((s) => s.progress.showCompletionModal);
  const activeJobId = useGameStore((s) => s.progress.activeJobId);
  const jobs = useGameStore((s) => s.jobs);
  const claimed = useGameStore((s) => s.progress.claimedRewardJobIds);
  const claimReward = useGameStore((s) => s.claimReward);
  const dismiss = useGameStore((s) => s.dismissCompletionModal);

  const job = jobs.find((j) => j.id === activeJobId);
  if (!show || !job) return null;

  const alreadyClaimed = claimed.includes(job.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-complete-title"
    >
      <div className="w-full max-w-md rounded-lg border border-stone-200 bg-[#f3f0e8] p-6 shadow-lg">
        <h2
          id="job-complete-title"
          className="font-[family-name:var(--font-display)] text-2xl text-emerald-950"
        >
          Job complete
        </h2>
        <p className="mt-2 text-stone-600">
          {job.title} is finished. Claim your reward once, then return to the
          task board.
        </p>
        <p className="mt-4 text-lg font-semibold text-emerald-900">
          +{job.reward.amount} credits
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {!alreadyClaimed ? (
            <Button
              onClick={() => {
                claimReward(job.id);
              }}
            >
              Claim Reward
            </Button>
          ) : (
            <p className="text-sm text-stone-500">Reward claimed.</p>
          )}
          <Link
            href="/"
            onClick={() => dismiss()}
            className="inline-flex items-center justify-center rounded-md bg-amber-100 px-4 py-2 text-sm font-medium text-amber-950 hover:bg-amber-200"
          >
            Back to Task Board
          </Link>
        </div>
      </div>
    </div>
  );
}
