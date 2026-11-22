"use client";

import { Button } from "@/components/ui/Button";
import { buildReviewSummary } from "@/game/garden/reviewSelectors";
import { useGameStore } from "@/game/store/gameStore";

export function WorkReviewPanel() {
  const garden = useGameStore((s) => s.work.garden);
  const setReviewOpen = useGameStore((s) => s.setReviewOpen);
  const startV03Garden = useGameStore((s) => s.startV03Garden);
  if (!garden?.reviewOpen) return null;
  const summary = buildReviewSummary(garden);

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-stone-950/35 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-[#f7f3ea] p-5 shadow-xl ring-1 ring-stone-900/10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          Work review
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Numbers come from what you actually did — not a fixed “wrong order”
          penalty.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded bg-white/70 px-3 py-2">
            <dt className="text-stone-500">Productive</dt>
            <dd className="text-lg font-medium">{summary.productive.toFixed(1)}</dd>
          </div>
          <div className="rounded bg-white/70 px-3 py-2">
            <dt className="text-stone-500">Setup / prep</dt>
            <dd className="text-lg font-medium">{summary.setup.toFixed(1)}</dd>
          </div>
          <div className="rounded bg-white/70 px-3 py-2">
            <dt className="text-stone-500">Rework</dt>
            <dd className="text-lg font-medium">{summary.rework.toFixed(1)}</dd>
          </div>
          <div className="rounded bg-white/70 px-3 py-2">
            <dt className="text-stone-500">Recovery</dt>
            <dd className="text-lg font-medium">
              {summary.recovery.toFixed(1)}
            </dd>
          </div>
        </dl>
        {summary.reworkNotes.length ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {summary.reworkNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-emerald-800">
            Little rework detected — cleanup stayed ahead of new clippings.
          </p>
        )}
        {summary.qualityNotes.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-700">
            {summary.qualityNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-emerald-800">
            Quality looks acceptable for a first pass.
          </p>
        )}
        <p className="mt-3 text-xs text-stone-500">
          Expert sample (discussion only): clear hazards → hedge → mow → gather
          debris once. Your path can differ if quality and safety hold.
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={() => setReviewOpen(false)}>
            Keep working
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (
                window.confirm(
                  "Start a fresh garden with the same conditions? (saves v0.1/v0.2 untouched)",
                )
              ) {
                startV03Garden();
              }
            }}
          >
            Try again (same yard)
          </Button>
          <Button onClick={() => setReviewOpen(false)}>Done</Button>
        </div>
      </div>
    </div>
  );
}
