"use client";

import { Button } from "@/components/ui/Button";
import { buildReviewSummary } from "@/game/garden/reviewSelectors";
import { compareVisits } from "@/game/learning/visitSummary";
import { useGameStore } from "@/game/store/gameStore";

export function WorkReviewPanel() {
  const work = useGameStore((s) => s.work);
  const garden = work.garden;
  const setReviewOpen = useGameStore((s) => s.setReviewOpen);
  const startV03Garden = useGameStore((s) => s.startV03Garden);
  const finishVisit = useGameStore((s) => s.finishVisit);
  if (!garden?.reviewOpen) return null;
  const summary = buildReviewSummary(garden, work);
  const history = garden.visitHistory ?? [];
  const current = history[history.length - 1];
  const previous = history.length >= 2 ? history[history.length - 2] : undefined;
  const compare =
    garden.visitFinished && current
      ? compareVisits(previous, current)
      : null;

  const bandLabel =
    summary.qualityBand === "acceptable"
      ? "Acceptable coverage for this visit"
      : summary.qualityBand === "needs-attention"
        ? "Needs attention — safety or damage issues remain"
        : "Incomplete — finishing records honesty, not a professional seal";

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-stone-950/35 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-[#f7f3ea] p-5 shadow-xl ring-1 ring-stone-900/10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {garden.visitFinished ? "Visit summary" : "Work review"}
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          From what you actually did — not a fixed “wrong order” penalty.
        </p>
        <p className="mt-2 text-sm font-medium text-stone-800">{bandLabel}</p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded bg-white/70 px-3 py-2">
            <dt className="text-stone-500">Lawn done</dt>
            <dd className="text-lg font-medium">
              {Math.round(summary.lawnFinishedPct)}%
            </dd>
          </div>
          <div className="rounded bg-white/70 px-3 py-2">
            <dt className="text-stone-500">Edge done</dt>
            <dd className="text-lg font-medium">
              {Math.round(summary.edgeFinishedPct)}%
            </dd>
          </div>
          <div className="rounded bg-white/70 px-3 py-2">
            <dt className="text-stone-500">Productive</dt>
            <dd className="text-lg font-medium">
              {summary.productive.toFixed(1)}
            </dd>
          </div>
          <div className="rounded bg-white/70 px-3 py-2">
            <dt className="text-stone-500">Setup / prep</dt>
            <dd className="text-lg font-medium">{summary.setup.toFixed(1)}</dd>
          </div>
          <div className="rounded bg-white/70 px-3 py-2">
            <dt className="text-stone-500">Rework (spent)</dt>
            <dd className="text-lg font-medium">{summary.rework.toFixed(1)}</dd>
          </div>
          <div className="rounded bg-white/70 px-3 py-2">
            <dt className="text-stone-500">Recovery</dt>
            <dd className="text-lg font-medium">
              {summary.recovery.toFixed(1)}
            </dd>
          </div>
        </dl>
        {summary.completionNotes.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-800">
            {summary.completionNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : null}
        {summary.reworkNotes.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-900">
            {summary.reworkNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-emerald-800">
            Little spent rework — cleanups stayed ahead of new clippings where you
            worked.
          </p>
        )}
        {summary.qualityNotes.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-700">
            {summary.qualityNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : summary.canFinishWell ? (
          <p className="mt-3 text-sm text-emerald-800">
            Safety and coverage look acceptable for finishing this visit.
          </p>
        ) : (
          <p className="mt-3 text-sm text-amber-900">
            More work remains — you can still finish and record an honest partial
            result.
          </p>
        )}
        {summary.learningAdvice.length ? (
          <div className="mt-3 rounded-md bg-white/80 px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              From your actions
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-stone-800">
              {summary.learningAdvice.map((a) => (
                <li key={`${a.eventId ?? a.text}`}>
                  {a.text}
                  {a.eventId ? (
                    <span className="ml-1 text-xs text-stone-400">
                      ({a.eventId})
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {compare ? (
          <div className="mt-3 rounded-md border border-stone-300/80 bg-white/70 px-3 py-2 text-sm">
            <p className="font-medium text-stone-800">Visit A/B compare</p>
            <p className="mt-1 text-stone-600">{compare.reason}</p>
            {compare.notes.map((n) => (
              <p key={n} className="mt-1 text-stone-700">
                {n}
              </p>
            ))}
            {compare.comparable && current && previous ? (
              <p className="mt-2 text-xs text-stone-500">
                Prior total {previous.effort.total.toFixed(1)} · This{" "}
                {current.effort.total.toFixed(1)} (game-modeled effort)
              </p>
            ) : null}
          </div>
        ) : null}
        <p className="mt-3 text-xs text-stone-500">
          One possible approach (not the only good one): clear local hazards →
          work that drops debris → gather once. Your path can differ if quality
          and safety hold.
        </p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={() => setReviewOpen(false)}>
            {garden.visitFinished ? "Close" : "Keep working"}
          </Button>
          {!garden.visitFinished ? (
            <Button variant="secondary" onClick={() => finishVisit()}>
              Finish this visit
            </Button>
          ) : null}
          <Button
            variant="secondary"
            onClick={() => {
              if (
                !window.confirm(
                  "Retry the same yard conditions? Sealed visit summaries are kept for A/B compare. Current unfinished work resets.",
                )
              ) {
                return;
              }
              const historyKeep = garden.visitHistory ?? [];
              startV03Garden();
              useGameStore.setState((s) => ({
                work: s.work.garden
                  ? {
                      ...s.work,
                      garden: {
                        ...s.work.garden,
                        visitHistory: historyKeep,
                        lastVisitNote: garden.lastVisitNote,
                      },
                    }
                  : s.work,
              }));
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
