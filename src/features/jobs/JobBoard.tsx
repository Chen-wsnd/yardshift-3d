"use client";

import { Button } from "@/components/ui/Button";
import { ShopPanel } from "@/features/economy/ShopPanel";
import { useGameStore } from "@/game/store/gameStore";
import { JobCard } from "./JobCard";

export function JobBoard() {
  const jobs = useGameStore((state) => state.jobs);
  const resetDemo = useGameStore((state) => state.resetDemo);
  const feedback = useGameStore((state) => state.progress.lastFeedback);

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
            Accept a contract, clean the yard with the right tools, claim your
            reward, then unlock the next job and shop upgrades.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            if (
              typeof window !== "undefined" &&
              window.confirm("Reset demo progress, inventory, and yard state?")
            ) {
              resetDemo();
            }
          }}
        >
          Reset Demo
        </Button>
      </div>
      {feedback ? (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {feedback}
        </p>
      ) : null}
      <div className="mt-2">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      <ShopPanel />
    </section>
  );
}
