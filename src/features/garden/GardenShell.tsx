"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { getGardenTask, GARDEN_TASKS } from "@/data/gardenTasks";
import { LAWN_ZONE_ID } from "@/data/lawnGrid";
import { useGameStore } from "@/game/store/gameStore";
import { WorkConfirm } from "./WorkConfirm";
import { WorkPlanPanel } from "./WorkPlanPanel";
import { WorkReviewPanel } from "./WorkReviewPanel";

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
  const setActiveGardenTask = useGameStore((s) => s.setActiveGardenTask);
  const selectTool = useGameStore((s) => s.selectTool);
  const rechargeTool = useGameStore((s) => s.rechargeTool);
  const clearJam = useGameStore((s) => s.clearJam);
  const setReviewOpen = useGameStore((s) => s.setReviewOpen);
  const inspectObject = useGameStore((s) => s.inspectObject);

  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [planOpen, setPlanOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (work.schemaVersion !== 3 || !work.activeJobId) {
      startV03Garden();
    }
  }, [hydrated, work.schemaVersion, work.activeJobId, startV03Garden]);

  const garden = work.garden;
  const activeTaskId = garden?.activeTaskId ?? null;
  const pendingTask = pendingTaskId ? getGardenTask(pendingTaskId) : null;
  const activeTask = activeTaskId ? getGardenTask(activeTaskId) : null;
  const event = work.lastEvents[0];

  const lawn = work.jobs["job-overgrown-lawn"]?.zones.find(
    (z) => z.id === LAWN_ZONE_ID,
  );
  const finishedCells =
    lawn?.cells.filter(
      (c) =>
        c.remainingWork <= 0 ||
        c.result === "finished" ||
        c.result === "scalped",
    ).length ?? 0;
  const looseDebris =
    Object.values(garden?.debris ?? {}).filter(
      (d) => d.state === "scattered" || d.state === "gathered",
    ).length ?? 0;
  const uncutHedge =
    Object.values(garden?.hedgeClusters ?? {}).filter((c) => !c.cut).length ??
    0;

  const selected = work.selectedToolId
    ? work.tools[work.selectedToolId]
    : undefined;
  const needsRecharge =
    selected &&
    (selected.resourceType === "battery" || selected.resourceType === "fuel") &&
    (selected.resource < 15 || selected.status === "unpowered");
  const needsJamClear = selected?.status === "jammed";

  const toolChoices = activeTask?.tools ?? [];

  return (
    <AppShell showBalance={false}>
      <div className="relative flex h-[calc(100vh-57px)] min-h-[520px] flex-col">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-3">
            {activeTaskId ? (
              <Button
                variant="secondary"
                onClick={() => setActiveGardenTask(null)}
              >
                Back to garden
              </Button>
            ) : null}
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-lg text-stone-900 sm:text-xl">
                {activeTask?.name ?? "Saturday morning garden"}
              </h1>
              <p className="text-xs text-stone-500 sm:text-sm">
                {!hydrated
                  ? "Restoring save…"
                  : activeTask
                    ? activeTask.designPurpose
                    : "Take a look around. What would you do first?"}
              </p>
              {activeTask ? (
                <p className="mt-0.5 hidden text-xs text-stone-400 sm:block">
                  {activeTask.strengthsLimits}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!activeTaskId ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    inspectObject("garden-overview");
                    setPlanOpen(false);
                  }}
                >
                  Inspect
                </Button>
                <Button variant="ghost" onClick={() => setPlanOpen((v) => !v)}>
                  Work plan
                </Button>
                <Button variant="secondary" onClick={() => setReviewOpen(true)}>
                  Work review
                </Button>
              </>
            ) : null}
            <Button
              variant="ghost"
              onClick={() => {
                if (
                  window.confirm(
                    "Reset the garden? (v0.1/v0.2 saves stay untouched)",
                  )
                ) {
                  startV03Garden();
                  setPendingTaskId(null);
                  setPlanOpen(false);
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
              activeTaskId={activeTaskId}
              onSelectTask={(id) => setPendingTaskId(id)}
            />
          </div>

          <WorkConfirm
            open={Boolean(pendingTask) && !activeTaskId}
            title={pendingTask?.prompt ?? "Start work?"}
            body={
              pendingTask
                ? `Tools: ${pendingTask.tools.join(", ") || "hands / inspect"}`
                : undefined
            }
            onCancel={() => setPendingTaskId(null)}
            onConfirm={() => {
              if (!pendingTaskId) return;
              const task = getGardenTask(pendingTaskId);
              setActiveGardenTask(pendingTaskId);
              if (task?.tools[0]) selectTool(task.tools[0]);
              setPendingTaskId(null);
            }}
          />

          <WorkPlanPanel open={planOpen} onClose={() => setPlanOpen(false)} />
          <WorkReviewPanel />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-3">
            <div className="pointer-events-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 rounded-lg bg-[#f7f3ea]/95 px-3 py-2 text-sm shadow-md ring-1 ring-stone-900/10">
              {activeTaskId && toolChoices.length ? (
                <>
                  {toolChoices.map((toolId) => {
                    const t = work.tools[toolId];
                    const label =
                      GARDEN_TASKS.find((x) => x.id === activeTaskId)
                        ?.tools.includes(toolId)
                        ? toolId
                            .split("-")
                            .map((w) => w[0]?.toUpperCase() + w.slice(1))
                            .join(" ")
                        : toolId;
                    const bat =
                      t &&
                      (t.resourceType === "battery" ||
                        t.resourceType === "fuel")
                        ? ` · ${Math.round(t.resource)}%`
                        : "";
                    return (
                      <button
                        key={toolId}
                        type="button"
                        className={`rounded-md px-3 py-1.5 ${
                          work.selectedToolId === toolId
                            ? "bg-emerald-800 text-white"
                            : "bg-white text-stone-800"
                        }`}
                        onClick={() => selectTool(toolId)}
                      >
                        {label}
                        {work.selectedToolId === toolId ? bat : ""}
                      </button>
                    );
                  })}
                  {needsRecharge ? (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (!work.selectedToolId) return;
                        rechargeTool(work.selectedToolId);
                      }}
                    >
                      Recharge
                    </Button>
                  ) : null}
                  {needsJamClear && work.selectedToolId ? (
                    <Button
                      variant="secondary"
                      onClick={() => clearJam(work.selectedToolId!)}
                    >
                      Clear jam
                    </Button>
                  ) : null}
                </>
              ) : (
                <span className="text-stone-600">
                  Lawn cut {finishedCells} · Hedge left {uncutHedge} · Debris{" "}
                  {looseDebris}
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
