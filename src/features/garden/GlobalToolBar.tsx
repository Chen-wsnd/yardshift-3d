"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EQUIPMENT_PROFILES } from "@/data/equipmentProfiles";
import { GARDEN_TOOL_BAR_IDS } from "@/game/interaction/toolTargetCapabilities";
import { useHoverIntent } from "@/game/interaction/hoverIntentStore";
import { getToolKnowledge } from "@/game/learning/toolKnowledge";
import { useGameStore } from "@/game/store/gameStore";
import { useLocale } from "@/i18n/LocaleProvider";

/**
 * Always-visible Tool Bar — selection does not require a TaskStage.
 * Condition = health (100% intact). Situational ! from hover preflight only.
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
  const [infoToolId, setInfoToolId] = useState<string | null>(null);
  const intent = useHoverIntent((s) => s.intent);
  const hit = useHoverIntent((s) => s.hit);

  const selectedId = work.selectedToolId;
  const selected = selectedId ? work.tools[selectedId] : undefined;
  const knowledgeId = infoToolId ?? selectedId;
  const knowledge = knowledgeId ? getToolKnowledge(knowledgeId) : undefined;

  const situational =
    intent &&
    (intent.level === "risk" ||
      intent.level === "ineffective" ||
      intent.level === "unavailable")
      ? intent
      : null;

  // Clear card on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setInfoOpen(false);
        setInfoToolId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const needsRecharge =
    selected &&
    (selected.resourceType === "battery" || selected.resourceType === "fuel") &&
    (selected.resource < 15 || selected.status === "unpowered");
  const needsJamClear = selected?.status === "jammed";
  const needsRepair = selected?.status === "broken";

  const openInfo = (id: string | null) => {
    setInfoToolId(id);
    setInfoOpen(true);
  };

  const conditionPct =
    selected && typeof selected.condition === "number"
      ? Math.round(selected.condition)
      : null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 p-2 sm:p-3">
      {situational ? (
        <div
          className={`pointer-events-auto max-w-xl rounded-lg px-3 py-2 text-xs shadow ring-1 sm:text-sm ${
            situational.level === "risk"
              ? "bg-red-50/95 text-red-950 ring-red-300"
              : situational.level === "unavailable"
                ? "bg-stone-100/95 text-stone-900 ring-stone-400"
                : "bg-amber-50/95 text-amber-950 ring-amber-300"
          }`}
          role="status"
          aria-live="polite"
          data-testid="situational-alert"
          data-reason={situational.reasonCode}
          data-level={situational.level}
        >
          <span className="mr-1 font-bold" aria-hidden>
            !
          </span>
          {t(situational.reasonCode)}
          {situational.warnsAbnormalWear ? (
            <span className="mt-0.5 block text-[11px] opacity-80">
              {t("intent.warn-abnormal-wear")}
            </span>
          ) : null}
          {hit?.id ? (
            <span className="mt-0.5 block text-[10px] opacity-60">
              {hit.kind}:{hit.id}
            </span>
          ) : null}
        </div>
      ) : null}

      {infoOpen && knowledge ? (
        <div
          className="pointer-events-auto max-h-48 w-full max-w-xl overflow-y-auto rounded-lg bg-[#f7f3ea]/95 px-3 py-2 text-xs text-stone-700 shadow ring-1 ring-stone-900/10 sm:text-sm"
          role="dialog"
          aria-label={t("toolbar.toolInfo")}
          data-testid="tool-info-card"
        >
          <p>
            <span className="font-medium">{t("tool.goodFor")}:</span>{" "}
            {knowledge.bestFor.join("; ")}
          </p>
          <p className="mt-1">
            <span className="font-medium">{t("tool.limit")}:</span>{" "}
            {knowledge.limitation}
          </p>
          <p className="mt-1 text-stone-500">{knowledge.effectToWatch}</p>
          {knowledge.preflight?.length ? (
            <p className="mt-1 text-stone-500">
              <span className="font-medium">{t("tool.check")}:</span>{" "}
              {knowledge.preflight.join("; ")}
            </p>
          ) : null}
          <button
            type="button"
            className="mt-1 text-emerald-800 underline"
            onClick={() => {
              setInfoOpen(false);
              setInfoToolId(null);
            }}
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
              data-testid="toolbar-tool-info"
              onClick={() => openInfo(selectedId)}
            >
              {infoOpen && infoToolId === selectedId
                ? t("common.close")
                : t("toolbar.toolInfo")}
            </button>
          ) : null}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible">
          <button
            type="button"
            disabled={sealed}
            aria-pressed={selectedId == null}
            data-testid="tool-hands"
            className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs sm:text-sm ${
              selectedToolHands(selectedId)
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
            const showRiskBang =
              active &&
              situational &&
              (situational.level === "risk" ||
                situational.level === "unavailable");
            const showAmberBang =
              active && situational && situational.level === "ineffective";
            return (
              <div key={id} className="relative shrink-0">
                <button
                  type="button"
                  disabled={sealed}
                  aria-pressed={active}
                  data-testid={`tool-${id}`}
                  className={`rounded-md px-2.5 py-1.5 text-xs sm:text-sm ${
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
                <button
                  type="button"
                  className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold leading-none ${
                    showRiskBang
                      ? "bg-red-600 text-white"
                      : showAmberBang
                        ? "bg-amber-500 text-white"
                        : "bg-stone-600 text-white"
                  }`}
                  aria-label={t("toolbar.toolInfo")}
                  data-testid={`tool-bang-${id}`}
                  data-bang={
                    showRiskBang ? "risk" : showAmberBang ? "warn" : "info"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    selectTool(id);
                    openInfo(id);
                  }}
                >
                  !
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 px-1">
          {needsRecharge && selectedId ? (
            <Button
              variant="secondary"
              disabled={sealed}
              data-testid="toolbar-recharge"
              onClick={() => rechargeTool(selectedId)}
            >
              {t("toolbar.recharge")}
            </Button>
          ) : null}
          {needsJamClear && selectedId ? (
            <Button
              variant="secondary"
              disabled={sealed}
              data-testid="toolbar-clear-jam"
              onClick={() => clearJam(selectedId)}
            >
              {t("toolbar.clearJam")}
            </Button>
          ) : null}
          {needsRepair && selectedId ? (
            <Button
              variant="secondary"
              disabled={sealed}
              data-testid="toolbar-repair"
              onClick={() => repairTool(selectedId)}
              title={t("toolbar.repairHint")}
            >
              {t("toolbar.repair")}
            </Button>
          ) : null}
          {!selectedId ? (
            <span className="text-xs text-stone-500">
              {t("toolbar.handsHint")}
            </span>
          ) : selected ? (
            <span
              className="text-xs text-stone-500"
              data-testid="toolbar-condition"
            >
              {selected.status}
              {conditionPct != null
                ? ` · ${t("toolbar.condition")} ${conditionPct}%`
                : ""}
              {conditionPct != null
                ? ` · ${t("toolbar.wear")} ${100 - conditionPct}%`
                : ""}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function selectedToolHands(selectedId: string | null | undefined) {
  return selectedId == null;
}
