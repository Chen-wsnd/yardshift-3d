"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/game/store/gameStore";
import { LAWN_ZONE_ID } from "@/data/lawnGrid";
import { WorkConfirm } from "./WorkConfirm";

const GardenCanvas = dynamic(
  () => import("./GardenCanvas").then((m) => m.GardenCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[480px] items-center justify-center bg-sky-100 text-stone-600">
        Loading garden…
      </div>
    ),
  },
);

export function GardenShell() {
  const work = useGameStore((s) => s.work);
  const hydrated = useGameStore((s) => s.hydrated);
  const startV03Garden = useGameStore((s) => s.startV03Garden);
  const focusZone = useGameStore((s) => s.focusZone);
  const selectTool = useGameStore((s) => s.selectTool);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (work.schemaVersion !== 3 || !work.activeJobId) {
      startV03Garden();
    }
  }, [hydrated, work.schemaVersion, work.activeJobId, startV03Garden]);

  const inTask = work.focusedZoneId === LAWN_ZONE_ID;
  const event = work.lastEvents[0];
  const job = work.jobs["job-overgrown-lawn"];
  const lawn = job?.zones.find((z) => z.id === LAWN_ZONE_ID);
  const finishedCells =
    lawn?.cells.filter(
      (c) =>
        c.remainingWork <= 0 ||
        c.result === "finished" ||
        c.result === "scalped",
    ).length ?? 0;
  const damagedCells =
    lawn?.cells.filter(
      (c) =>
        c.result === "flower_damaged" ||
        c.damageKinds.includes("flower_damaged"),
    ).length ?? 0;
  const partialCells =
    lawn?.cells.filter(
      (c) =>
        c.result === "partial" ||
        (c.remainingWork < 100 && c.remainingWork > 0),
    ).length ?? 0;
  const battery = work.tools["lawn-mower"]?.resource ?? 0;

  return (
    <AppShell showBalance={false}>
      <div className="relative flex h-[calc(100vh-57px)] min-h-[520px] flex-col">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-3">
            {inTask ? (
              <Button variant="secondary" onClick={() => focusZone(null)}>
                Back to garden
              </Button>
            ) : null}
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-lg text-stone-900 sm:text-xl">
                {inTask ? "Front lawn" : "Saturday morning garden"}
              </h1>
              <p className="text-xs text-stone-500 sm:text-sm">
                {!hydrated
                  ? "Restoring save…"
                  : inTask
                    ? "Press-drag to mow. Still clicks do nothing."
                    : "Click the lawn when it highlights."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                if (
                  window.confirm(
                    "Reset the garden lawn slice? (v0.1/v0.2 saves stay untouched)",
                  )
                ) {
                  startV03Garden();
                  setConfirmOpen(false);
                }
              }}
            >
              Reset garden
            </Button>
            <Link
              href="/legacy"
              className="rounded-md px-3 py-2 text-sm text-stone-500 hover:bg-stone-100"
            >
              Legacy v0.2
            </Link>
          </div>
        </div>

        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-0">
            <GardenCanvas
              mode={inTask ? "lawn-task" : "overview"}
              onSelectLawn={() => setConfirmOpen(true)}
            />
          </div>
          <WorkConfirm
            open={confirmOpen && !inTask}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={() => {
              setConfirmOpen(false);
              focusZone(LAWN_ZONE_ID);
            }}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-3">
            <div className="pointer-events-auto flex max-w-2xl flex-wrap items-center justify-center gap-2 rounded-lg bg-[#f7f3ea]/95 px-3 py-2 text-sm shadow-md ring-1 ring-stone-900/10">
              {inTask ? (
                <>
                  <button
                    type="button"
                    className={`rounded-md px-3 py-1.5 ${
                      work.selectedToolId === "manual-reel-mower"
                        ? "bg-emerald-800 text-white"
                        : "bg-white text-stone-800"
                    }`}
                    onClick={() => selectTool("manual-reel-mower")}
                  >
                    Manual Reel Mower
                  </button>
                  <button
                    type="button"
                    className={`rounded-md px-3 py-1.5 ${
                      work.selectedToolId === "lawn-mower"
                        ? "bg-emerald-800 text-white"
                        : "bg-white text-stone-800"
                    }`}
                    onClick={() => selectTool("lawn-mower")}
                  >
                    Battery Self-Propelled
                    {work.selectedToolId === "lawn-mower"
                      ? ` · ${Math.round(battery)}%`
                      : ""}
                  </button>
                </>
              ) : (
                <span className="text-stone-600">
                  Cut {finishedCells} · Partial {partialCells} · Damaged{" "}
                  {damagedCells}
                </span>
              )}
            </div>
          </div>

          {event ? (
            <div
              className="pointer-events-none absolute left-3 top-14 z-10 max-w-sm rounded-md bg-emerald-50/95 px-3 py-2 text-sm text-emerald-950 ring-1 ring-emerald-200"
              role="status"
            >
              {event.explanation}
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
