"use client";

import { Button } from "@/components/ui/Button";
import { buildReviewSummary } from "@/game/garden/reviewSelectors";
import { compareVisits } from "@/game/learning/visitSummary";
import { useGameStore } from "@/game/store/gameStore";
import { useLocale } from "@/i18n/LocaleProvider";

function fill(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  let out = template;
  for (const [k, v] of Object.entries(params)) {
    out = out.replaceAll(`{${k}}`, String(v));
  }
  return out;
}

export function WorkReviewPanel() {
  const { t } = useLocale();
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

  const bandLabel = t(`review.band.${summary.qualityBand}`);

  const tf = (key: string, params?: Record<string, string | number>, fb?: string) =>
    fill(t(key, fb), params);

  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-stone-950/35 p-4">
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-[#f7f3ea] shadow-xl ring-1 ring-stone-900/10"
        data-testid="work-review-panel"
      >
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
            {garden.visitFinished
              ? t("review.titleVisit")
              : t("review.titleWork")}
          </h2>
          <p className="mt-1 text-sm text-stone-600">{t("review.intro")}</p>
          <p className="mt-2 text-sm font-medium text-stone-800">{bandLabel}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded bg-white/70 px-3 py-2">
              <dt className="text-stone-500">{t("review.metric.lawn")}</dt>
              <dd className="text-lg font-medium">
                {Math.round(summary.lawnFinishedPct)}%
              </dd>
            </div>
            <div className="rounded bg-white/70 px-3 py-2">
              <dt className="text-stone-500">{t("review.metric.edge")}</dt>
              <dd className="text-lg font-medium">
                {Math.round(summary.edgeFinishedPct)}%
              </dd>
            </div>
            <div className="rounded bg-white/70 px-3 py-2">
              <dt className="text-stone-500">{t("review.metric.productive")}</dt>
              <dd className="text-lg font-medium">
                {summary.productive.toFixed(1)}
              </dd>
            </div>
            <div className="rounded bg-white/70 px-3 py-2">
              <dt className="text-stone-500">{t("review.metric.setup")}</dt>
              <dd className="text-lg font-medium">{summary.setup.toFixed(1)}</dd>
            </div>
            <div className="rounded bg-white/70 px-3 py-2">
              <dt className="text-stone-500">{t("review.metric.rework")}</dt>
              <dd className="text-lg font-medium">{summary.rework.toFixed(1)}</dd>
            </div>
            <div className="rounded bg-white/70 px-3 py-2">
              <dt className="text-stone-500">{t("review.metric.recovery")}</dt>
              <dd className="text-lg font-medium">
                {summary.recovery.toFixed(1)}
              </dd>
            </div>
          </dl>
          {summary.completionItems.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-800">
              {summary.completionItems.map((n) => (
                <li key={n.code}>
                  {tf(n.code, n.params)}
                </li>
              ))}
            </ul>
          ) : null}
          {summary.reworkItems.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-900">
              {summary.reworkItems.map((n) => (
                <li key={`${n.code}-${n.params?.count ?? n.params?.amount ?? ""}`}>
                  {tf(n.code, n.params)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-emerald-800">
              {t("review.littleRework")}
            </p>
          )}
          {summary.qualityItems.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-700">
              {summary.qualityItems.map((n) => (
                <li key={n.code}>{tf(n.code, n.params)}</li>
              ))}
            </ul>
          ) : summary.canFinishWell ? (
            <p className="mt-3 text-sm text-emerald-800">
              {t("review.finishOk")}
            </p>
          ) : (
            <p className="mt-3 text-sm text-amber-900">
              {t("review.finishPartial")}
            </p>
          )}
          {summary.learningAdvice.length ? (
            <div className="mt-3 rounded-md bg-white/80 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                {t("review.fromActions")}
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-stone-800">
                {summary.learningAdvice.map((a) => (
                  <li key={`${a.code}-${a.eventId ?? a.entityId ?? a.text}`}>
                    {t(a.code, a.text)}
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
              <p className="font-medium text-stone-800">
                {t("review.compareTitle")}
              </p>
              <p className="mt-1 text-stone-600">
                {tf(
                  compare.reasonCode,
                  compare.reasonParams,
                  compare.reason,
                )}
              </p>
              {(compare.noteItems.length
                ? compare.noteItems.map((n) => (
                    <p key={n.code} className="mt-1 text-stone-700">
                      {tf(n.code, n.params)}
                    </p>
                  ))
                : compare.notes.map((n) => (
                    <p key={n} className="mt-1 text-stone-700">
                      {n}
                    </p>
                  )))}
              {compare.comparable && current && previous ? (
                <p className="mt-2 text-xs text-stone-500">
                  {tf("review.compareEffort", {
                    prior: previous.effort.total.toFixed(1),
                    current: current.effort.total.toFixed(1),
                  })}
                </p>
              ) : null}
            </div>
          ) : null}
          <p className="mt-3 text-xs text-stone-500">{t("review.approachHint")}</p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-stone-200/80 bg-[#f7f3ea] px-5 py-3">
          <Button variant="ghost" onClick={() => setReviewOpen(false)}>
            {garden.visitFinished
              ? t("review.close")
              : t("review.keepWorking")}
          </Button>
          {!garden.visitFinished ? (
            <Button variant="secondary" onClick={() => finishVisit()}>
              {t("review.finishVisit")}
            </Button>
          ) : null}
          <Button
            variant="secondary"
            onClick={() => {
              if (!window.confirm(t("review.retryConfirm"))) {
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
            {t("review.tryAgain")}
          </Button>
          <Button onClick={() => setReviewOpen(false)}>{t("review.done")}</Button>
        </div>
      </div>
    </div>
  );
}
