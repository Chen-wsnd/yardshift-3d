"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CompletionModal } from "@/features/jobs/CompletionModal";
import { ToolSelector } from "@/features/tools";
import { YardHud } from "@/features/yard/YardHud";
import { useGameStore } from "@/game/store/gameStore";

const YardCanvas = dynamic(
  () =>
    import("@/features/yard/YardCanvas").then((mod) => mod.YardCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[420px] items-center justify-center bg-sky-100 text-stone-600">
        Loading yard…
      </div>
    ),
  },
);

export default function YardPage() {
  const yardName = useGameStore((state) => state.yard.name);
  const activeJobId = useGameStore((state) => state.progress.activeJobId);
  const jobs = useGameStore((state) => state.jobs);
  const enterActiveJob = useGameStore((state) => state.enterActiveJob);
  const hydrated = useGameStore((state) => state.hydrated);
  const activeJob = jobs.find((job) => job.id === activeJobId);

  useEffect(() => {
    if (activeJobId) {
      enterActiveJob();
    }
  }, [activeJobId, enterActiveJob]);

  return (
    <AppShell>
      <div className="flex flex-col gap-0 lg:h-[calc(100vh-57px)] lg:flex-row">
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 px-4 py-3 sm:px-6">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-xl text-stone-900">
                {yardName}
              </h1>
              <p className="text-sm text-stone-500">
                {!hydrated
                  ? "Restoring save…"
                  : activeJob
                    ? `Job: ${activeJob.title}`
                    : "No active job — accept one from the task board."}
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
            >
              Back to Task Board
            </Link>
          </div>
          <div className="relative min-h-[420px] flex-1">
            <YardHud />
            <YardCanvas />
          </div>
        </div>
        <ToolSelector />
      </div>
      <CompletionModal />
    </AppShell>
  );
}
