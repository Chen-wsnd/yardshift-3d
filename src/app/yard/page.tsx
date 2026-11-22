"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { SimpleJobResult } from "@/features/jobs/SimpleJobResult";
import { EquipmentPanel } from "@/features/tools/EquipmentPanel";
import { useGameStore } from "@/game/store/gameStore";
import { SCENE_LAYOUTS } from "@/data/sceneLayouts";

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
  const work = useGameStore((s) => s.work);
  const focusZone = useGameStore((s) => s.focusZone);
  const hydrated = useGameStore((s) => s.hydrated);
  const jobId = work.activeJobId;
  const layout = SCENE_LAYOUTS[jobId ?? "job-overgrown-lawn"];
  const zone = jobId
    ? work.jobs[jobId]?.zones.find((z) => z.id === work.focusedZoneId)
    : null;
  const event = work.lastEvents[0];

  return (
    <AppShell>
      <div className="flex flex-col gap-0 lg:h-[calc(100vh-57px)] lg:flex-row">
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 px-4 py-3 sm:px-6">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-xl text-stone-900">
                {layout?.name ?? "Backyard"}{" "}
                {zone ? `· ${zone.name}` : "· Overview"}
              </h1>
              <p className="text-sm text-stone-500">
                {!hydrated
                  ? "Restoring save…"
                  : jobId
                    ? zone
                      ? "Drag or click with your tool. Right-side toolbox shows condition."
                      : "Click a highlighted work zone to focus."
                    : "Accept a job from the Task Board first."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {zone ? (
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
                  onClick={() => focusZone(null)}
                >
                  Back to overview
                </button>
              ) : null}
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
              >
                Task Board
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-16 z-10 flex flex-col gap-2 p-3 sm:p-4">
            <div className="pointer-events-auto max-w-md">
              <SimpleJobResult />
            </div>
            {event ? (
              <div
                className="pointer-events-auto max-w-md rounded-md border border-emerald-200 bg-emerald-50/95 px-3 py-2 text-sm text-emerald-950"
                role="status"
              >
                {event.explanation}
              </div>
            ) : null}
          </div>
          <div className="relative min-h-[420px] flex-1">
            <YardCanvas />
          </div>
        </div>
        <EquipmentPanel />
      </div>
    </AppShell>
  );
}
