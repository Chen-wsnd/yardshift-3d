"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { getGardenTask } from "@/data/gardenTasks";
import { LAWN_ZONE_ID } from "@/data/lawnGrid";
import { getToolKnowledge } from "@/game/learning/toolKnowledge";
import { useGameStore } from "@/game/store/gameStore";
import { useLocale } from "@/i18n/LocaleProvider";
import { GlobalToolBar } from "./GlobalToolBar";
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
  const { t } = useLocale();
  const work = useGameStore((s) => s.work);
  const hydrated = useGameStore((s) => s.hydrated);
  const startV03Garden = useGameStore((s) => s.startV03Garden);
  const setActiveGardenTask = useGameStore((s) => s.setActiveGardenTask);
  const setReviewOpen = useGameStore((s) => s.setReviewOpen);
  const finishVisit = useGameStore((s) => s.finishVisit);
  const inspectObject = useGameStore((s) => s.inspectObject);
  const setFocusPoint = useGameStore((s) => s.setFocusPoint);

  const [planOpen, setPlanOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (work.schemaVersion !== 3 || !work.activeJobId) {
      startV03Garden();
    }
  }, [hydrated, work.schemaVersion, work.activeJobId, startV03Garden]);

  // Ensure Hands/Inspect default — never auto-pick a work tool
  useEffect(() => {
    if (!hydrated) return;
    // leave whatever player selected; first load often null already
  }, [hydrated]);

  const garden = work.garden;
  const focusAreaId = garden?.activeTaskId ?? null;
  const focusArea = focusAreaId ? getGardenTask(focusAreaId) : null;
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

  const visitSealed = Boolean(garden?.visitFinished);

  return (
    <AppShell showBalance={false}>
      <div className="relative flex h-[calc(100vh-57px)] min-h-[520px] flex-col">
        {visitSealed ? (
          <div className="shrink-0 bg-amber-100 px-4 py-1.5 text-center text-xs text-amber-950">
            {t("garden.sealedBanner")}
          </div>
        ) : null}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 px-4 py-2 sm:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="font-[family-name:var(--font-display)] text-lg text-stone-900 sm:text-xl">
              {t("garden.title")}
              {focusArea ? (
                <span className="ml-2 text-sm font-normal text-stone-500">
                  · {focusArea.name}
                </span>
              ) : null}
            </h1>
            <p className="text-xs text-stone-500 sm:text-sm">
              {!hydrated ? "…" : t("garden.prompt")}
            </p>
            <p className="mt-0.5 hidden text-xs text-stone-400 sm:block">
              Lawn {finishedCells} · Hedge {uncutHedge} · Debris {looseDebris}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              disabled={visitSealed}
              onClick={() => {
                inspectObject("garden-overview");
                setPlanOpen(false);
              }}
            >
              {t("garden.inspect")}
            </Button>
            <Button variant="ghost" onClick={() => setPlanOpen((v) => !v)}>
              {t("garden.plan")}
            </Button>
            <Button variant="secondary" onClick={() => setReviewOpen(true)}>
              {t("garden.review")}
            </Button>
            <Button
              variant="secondary"
              disabled={visitSealed}
              onClick={() => finishVisit()}
            >
              {t("garden.finish")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (
                  window.confirm(
                    "Reset the garden? (v0.1/v0.2 saves stay untouched)",
                  )
                ) {
                  startV03Garden();
                  setPlanOpen(false);
                  setActiveGardenTask(null);
                }
              }}
            >
              {t("garden.reset")}
            </Button>
            <Link
              href="/legacy"
              className="rounded-md px-3 py-2 text-sm text-stone-500 hover:bg-stone-100"
            >
              {t("legacy.note")}
            </Link>
          </div>
        </div>

        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-0">
            <GardenCanvas
              onFocusArea={(id) => {
                const task = getGardenTask(id);
                if (task) {
                  setFocusPoint({ x: task.center[0], z: task.center[2] });
                }
                setActiveGardenTask(id);
              }}
            />
          </div>

          <WorkPlanPanel open={planOpen} onClose={() => setPlanOpen(false)} />
          <WorkReviewPanel />

          <GlobalToolBar />

          {work.selectedToolId ? (
            <div className="pointer-events-none absolute bottom-36 left-3 z-10 max-w-xs rounded-md bg-white/90 px-3 py-2 text-xs text-stone-700 ring-1 ring-stone-200 sm:bottom-40">
              {getToolKnowledge(work.selectedToolId)?.effectToWatch ??
                "Watch how this tool changes the yard."}
            </div>
          ) : null}
          {event ? (
            <div
              className="pointer-events-none absolute left-3 top-3 z-10 max-w-sm rounded-md bg-emerald-50/95 px-3 py-2 text-sm text-emerald-950 ring-1 ring-emerald-200"
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
