"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EQUIPMENT_PROFILES } from "@/data/equipmentProfiles";
import { GARDEN_TOOL_BAR_IDS } from "@/game/interaction/toolTargetCapabilities";
import { getToolKnowledge } from "@/game/learning/toolKnowledge";
import { useGameStore } from "@/game/store/gameStore";
import { useLocale } from "@/i18n/LocaleProvider";

/**
 * Always-visible Tool Bar — tool selection does not require entering a TaskStage.
 */
export function GlobalToolBar() {
  const { t } = useLocale();
  const work = useGameStore((s) => s.work);
  const selectTool = useGameStore((s) => s.selectTool);
  const rechargeTool = useGameStore((s) => s.rechargeTool);
  const clearJam = useGameStore((s) => s.clearJam);
  const repairTool = useGameStore((s) => s.repairTool);
  const sealed = Boolean(work.garden?.visitFinished);
  const [infoOpen, setInfoOpen] = useState(false);

  const selectedId = work.selectedToolId;
  const selected = selectedId ? work.tools[selectedId] : undefined;
  const knowledge = selectedId ? getToolKnowledge(selectedId) : undefined;

  const needsRecharge =
    selected &&
    (selected.resourceType === "battery" || selected.resourceType === "fuel") &&
    (selected.resource < 15 || selected.status === "unpowered");
  const needsJamClear = selected?.status === "jammed";
  const needsRepair = selected?.status === "broken";

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 p-2 sm:p-3">
      {infoOpen && knowledge ? (
        <div className="pointer-events-auto max-h-40 w-full max-w-xl overflow-y-auto rounded-lg bg-[#f7f3ea]/95 px-3 py-2 text-xs text-stone-700 shadow ring-1 ring-stone-900/10 sm:text-sm">
          <p>
            <span className="font-medium">{t("tool.goodFor")}:</span>{" "}
            {knowledge.bestFor.join("; ")}
          </p>
          <p className="mt-1">
            <span className="font-medium">{t("tool.limit")}:</span>{" "}
            {knowledge.limitation}
          </p>
          <p className="mt-1 text-stone-500">{knowledge.effectToWatch}</p>
          <button
            type="button"
            className="mt-1 text-emerald-800 underline"
            onClick={() => setInfoOpen(false)}
          >
            {t("common.close")}
          </button>
        </div>
      ) : null}

      <div
        className="pointer-events-auto flex w-full max-w-5xl flex-col gap-2 rounded-lg bg-[#f7f3ea]/95 px-2 py-2 shadow-md ring-1 ring-stone-900/10 sm:px-3"
        role="toolbar"
        aria-label={t("toolbar.label")}
      >
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-[10px] font-medium uppercase tracking-wide text-stone-500 sm:text-xs">
            {t("toolbar.label")}
            {sealed ? ` · ${t("toolbar.sealed")}` : ""}
          </span>
          {selectedId && knowledge ? (
            <button
              type="button"
              className="text-[10px] text-emerald-800 underline sm:text-xs"
              onClick={() => setInfoOpen((v) => !v)}
            >
              {infoOpen ? t("common.close") : t("toolbar.toolInfo")}
            </button>
          ) : null}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible">
          <button
            type="button"
            disabled={sealed}
            aria-pressed={selectedId == null}
            className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs sm:text-sm ${
              selectedId == null
                ? "bg-emerald-800 text-white"
                : "bg-white text-stone-800 ring-1 ring-stone-300"
            } disabled:opacity-50`}
            onClick={() => selectTool(null)}
            title={t("toolbar.handsHint")}
          >
            {t("toolbar.hands")}
          </button>

          {GARDEN_TOOL_BAR_IDS.map((id) => {
            const profile = EQUIPMENT_PROFILES.find((p) => p.id === id);
            const tool = work.tools[id];
            const active = selectedId === id;
            const bat =
              tool &&
              (tool.resourceType === "battery" || tool.resourceType === "fuel")
                ? ` ${Math.round(tool.resource)}%`
                : "";
            const statusHint =
              tool?.status && tool.status !== "ready"
                ? ` · ${tool.status}`
                : "";
            return (
              <button
                key={id}
                type="button"
                disabled={sealed}
                aria-pressed={active}
                data-testid={`tool-${id}`}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs sm:text-sm ${
                  active
                    ? "bg-emerald-800 text-white"
                    : "bg-white text-stone-800 ring-1 ring-stone-300"
                } disabled:opacity-50`}
                title={profile?.description}
                onClick={() => selectTool(id)}
              >
                {t(`tool.name.${id}`, profile?.name ?? id)}
                {active ? bat : ""}
                {active ? statusHint : ""}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 px-1">
          {needsRecharge && selectedId ? (
            <Button
              variant="secondary"
              disabled={sealed}
              onClick={() => rechargeTool(selectedId)}
            >
              {t("toolbar.recharge")}
            </Button>
          ) : null}
          {needsJamClear && selectedId ? (
            <Button
              variant="secondary"
              disabled={sealed}
              onClick={() => clearJam(selectedId)}
            >
              {t("toolbar.clearJam")}
            </Button>
          ) : null}
          {needsRepair && selectedId ? (
            <Button
              variant="secondary"
              disabled={sealed}
              onClick={() => repairTool(selectedId)}
              title={t("toolbar.repairHint")}
            >
              {t("toolbar.repair")}
            </Button>
          ) : null}
          {!selectedId ? (
            <span className="text-xs text-stone-500">{t("toolbar.handsHint")}</span>
          ) : selected ? (
            <span className="text-xs text-stone-500">
              {selected.status}
              {typeof selected.condition === "number"
                ? ` · ${t("toolbar.wear")} ${Math.round(selected.condition)}%`
                : ""}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
