"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EQUIPMENT_PROFILES } from "@/data/equipmentProfiles";
import { getToolKnowledge, toolContrastLine } from "@/game/learning/toolKnowledge";

export function WorkConfirm({
  open,
  title,
  body,
  sceneFact,
  toolIds,
  lastUsedToolId,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  /** One-line field condition — not “best tool” advice */
  sceneFact?: string;
  toolIds?: string[];
  /** Remembered choice from a prior visit to this task (not auto-applied) */
  lastUsedToolId?: string | null;
  onConfirm: (toolId: string | null) => void;
  onCancel: () => void;
}) {
  const ids = toolIds ?? [];
  // Explicit selection required — do not default to ids[0] (G01 / Q02)
  const [chosen, setChosen] = useState<string | null>(null);
  if (!open) return null;

  const handsOnly = ids.length === 0;
  const knowledge = chosen ? getToolKnowledge(chosen) : undefined;
  const canStart = handsOnly || chosen != null;

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-20 flex items-end justify-center bg-stone-950/25 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-confirm-title"
    >
      <div className="w-full max-w-md rounded-lg bg-[#f7f3ea] px-5 py-4 shadow-lg ring-1 ring-stone-900/10">
        <h2
          id="work-confirm-title"
          className="font-[family-name:var(--font-display)] text-xl text-stone-900"
        >
          {title}
        </h2>
        {sceneFact ? (
          <p className="mt-2 rounded-md bg-white/70 px-3 py-2 text-sm text-stone-700">
            <span className="font-medium">On site: </span>
            {sceneFact}
          </p>
        ) : null}
        {body ? (
          <p className="mt-2 text-sm text-stone-600">{body}</p>
        ) : null}
        {ids.length ? (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Choose a tool — none is selected until you pick
            </p>
            <div className="flex flex-wrap gap-2">
              {ids.map((id) => {
                const name =
                  EQUIPMENT_PROFILES.find((p) => p.id === id)?.name ?? id;
                const active = chosen === id;
                return (
                  <button
                    key={id}
                    type="button"
                    className={`rounded-md px-3 py-1.5 text-sm ${
                      active
                        ? "bg-emerald-800 text-white"
                        : "bg-white text-stone-800 ring-1 ring-stone-300"
                    }`}
                    onClick={() => setChosen(id)}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
            {lastUsedToolId && ids.includes(lastUsedToolId) ? (
              <button
                type="button"
                className="text-xs text-emerald-800 underline"
                onClick={() => setChosen(lastUsedToolId)}
              >
                Use your last choice:{" "}
                {EQUIPMENT_PROFILES.find((p) => p.id === lastUsedToolId)
                  ?.name ?? lastUsedToolId}
              </button>
            ) : null}
            {knowledge ? (
              <div className="rounded-md bg-white/80 px-3 py-2 text-sm text-stone-700">
                <p>
                  <span className="font-medium">Good for:</span>{" "}
                  {knowledge.bestFor.join("; ")}
                </p>
                <p className="mt-1">
                  <span className="font-medium">Limit:</span>{" "}
                  {knowledge.limitation}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Watch for: {knowledge.effectToWatch}
                </p>
                {knowledge.realismNote ? (
                  <p className="mt-1 text-xs italic text-stone-400">
                    {knowledge.realismNote}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-amber-900">
                Select a tool to see what it is good for and what it cannot do.
              </p>
            )}
            <p className="text-xs text-stone-500">{toolContrastLine(ids)}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-stone-600">Hands / inspect</p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Not now
          </Button>
          <Button
            disabled={!canStart}
            onClick={() => onConfirm(handsOnly ? null : chosen)}
            title={
              canStart
                ? undefined
                : "Pick a tool first"
            }
          >
            {handsOnly
              ? "Inspect area"
              : canStart
                ? "Start with this tool"
                : "Pick a tool first"}
          </Button>
        </div>
      </div>
    </div>
  );
}
