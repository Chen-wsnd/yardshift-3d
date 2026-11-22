"use client";

import { useGameStore } from "@/game/store/gameStore";
import { JobCard } from "./JobCard";

export function JobBoard() {
  const jobs = useGameStore((state) => state.jobs);

  return (
    <section aria-labelledby="task-board-heading">
      <h1
        id="task-board-heading"
        className="font-[family-name:var(--font-display)] text-3xl text-emerald-950 sm:text-4xl"
      >
        Task Board
      </h1>
      <p className="mt-2 max-w-prose text-stone-600">
        Browse gardening contracts, accept a job, then head into the yard with
        your tools.
      </p>
      <div className="mt-2">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}
