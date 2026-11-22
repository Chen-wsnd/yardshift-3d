import { LAWN_ZONE_ID } from "@/data/lawnGrid";
import { V03_GARDEN_JOB_ID } from "@/game/work/gardenFixtures";
import type { WorkSnapshot } from "@/game/work/types";
import { buildLearningAdvice } from "@/game/learning/learningAdvice";
import { countPotentialRedirty } from "./spatialRework";
import type { GardenDomain } from "./types";

export interface ReviewSummary {
  productive: number;
  setup: number;
  rework: number;
  ineffective: number;
  recovery: number;
  total: number;
  qualityNotes: string[];
  reworkNotes: string[];
  completionNotes: string[];
  learningAdvice: {
    text: string;
    eventId?: string;
    areaId?: string;
    sourceType?: "event" | "current-state";
    entityId?: string;
  }[];
  unresolvedHazards: number;
  uncutHedge: number;
  looseDebris: number;
  weedsWithRoots: number;
  damagedFlowers: number;
  lawnFinishedPct: number;
  edgeFinishedPct: number;
  canFinishWell: boolean;
  potentialRedirty: number;
  qualityBand: "incomplete" | "acceptable" | "needs-attention";
}

function lawnFinishedPct(work: WorkSnapshot | undefined): number {
  if (!work) return 0;
  const job = work.jobs[V03_GARDEN_JOB_ID];
  const lawn = job?.zones.find((z) => z.id === LAWN_ZONE_ID);
  if (!lawn || lawn.cells.length === 0) return 0;
  // Do not count protected flower cells as "mowed progress" for finish %
  const mowable = lawn.cells.filter((c) => c.protectedKind !== "flower");
  if (mowable.length === 0) return 100;
  const done = mowable.filter(
    (c) =>
      c.remainingWork <= 0 ||
      c.result === "finished" ||
      c.result === "scalped",
  ).length;
  return (done / mowable.length) * 100;
}

function edgeFinishedPct(domain: GardenDomain): number {
  const segs = Object.values(domain.edgeSegments ?? {});
  if (segs.length === 0) return 100;
  const done = segs.filter((s) => s.finished || s.remaining <= 0).length;
  return (done / segs.length) * 100;
}

function counts(p: { countsTowardCompletion?: boolean }) {
  return p.countsTowardCompletion !== false;
}

/**
 * Derive review from real events + WorkSnapshot.
 * Rework effort comes only from cleanup actions marked isRework.
 */
export function buildReviewSummary(
  domain: GardenDomain,
  work?: WorkSnapshot,
): ReviewSummary {
  const e = domain.effort;
  const total = e.productive + e.setup + e.rework + e.ineffective + e.recovery;

  const redirt = countPotentialRedirty(domain);

  const unresolvedHazards = Object.values(domain.hazards).filter(
    (h) => !h.cleared,
  ).length;
  const uncutHedge = Object.values(domain.hedgeClusters).filter(
    (c) => !c.cut,
  ).length;
  const looseDebris = Object.values(domain.debris).filter(
    (d) => d.state === "scattered" || d.state === "gathered",
  ).length;
  const weedsWithRoots = Object.values(domain.plants).filter(
    (p) => p.kind === "weed" && !p.rootRemoved && counts(p),
  ).length;
  const damagedFlowers = Object.values(domain.plants).filter(
    (p) => p.kind === "flower" && p.ornamentalDamage,
  ).length;
  const lawnPct = lawnFinishedPct(work);
  const edgePct = edgeFinishedPct(domain);

  const qualityNotes: string[] = [];
  const completionNotes: string[] = [];

  if (lawnPct < 70)
    completionNotes.push(
      `Lawn about ${Math.round(lawnPct)}% finished — major open grass still uncut.`,
    );
  if (edgePct < 70)
    completionNotes.push(
      `Path edge about ${Math.round(edgePct)}% finished — mowing alone does not tidy the edge.`,
    );
  if (uncutHedge > 0)
    qualityNotes.push(`${uncutHedge} hedge clusters still overgrown.`);
  if (weedsWithRoots > 0)
    qualityNotes.push(
      `${weedsWithRoots} weeds still have roots (top-cutting is not enough).`,
    );
  if (damagedFlowers > 0)
    qualityNotes.push(`${damagedFlowers} ornamental flowers damaged.`);
  if (looseDebris > 3)
    qualityNotes.push(`${looseDebris} debris piles still on the ground.`);
  if (unresolvedHazards > 0)
    qualityNotes.push(`${unresolvedHazards} hazards still present.`);

  const reworkNotes: string[] = [];
  if (e.rework > 0.01) {
    reworkNotes.push(
      `You spent ${e.rework.toFixed(1)} effort units re-cleaning areas that had already been cleared and then dirtied again.`,
    );
  }
  if (redirt.count > 0) {
    reworkNotes.push(
      `${redirt.count} new clipping pile(s) landed on previously cleaned ground` +
        (e.rework > 0.01
          ? " — you already cleaned some of that again."
          : " — still waiting for a second cleanup (not yet counted as spent rework)."),
    );
    reworkNotes.push(...redirt.notes.slice(0, 4));
  }

  const canFinishWell =
    unresolvedHazards === 0 &&
    damagedFlowers === 0 &&
    lawnPct >= 70 &&
    edgePct >= 50 &&
    uncutHedge <= 2 &&
    weedsWithRoots <= 1 &&
    looseDebris <= 4;

  let qualityBand: ReviewSummary["qualityBand"] = "incomplete";
  if (damagedFlowers > 0 || unresolvedHazards > 0) qualityBand = "needs-attention";
  else if (canFinishWell) qualityBand = "acceptable";

  return {
    productive: e.productive,
    setup: e.setup,
    rework: e.rework,
    ineffective: e.ineffective,
    recovery: e.recovery,
    total,
    qualityNotes,
    reworkNotes,
    completionNotes,
    learningAdvice: buildLearningAdvice(domain, {
      weedsWithRoots,
      lawnFinishedPct: lawnPct,
      edgeFinishedPct: edgePct,
      unresolvedHazards,
    }),
    unresolvedHazards,
    uncutHedge,
    looseDebris,
    weedsWithRoots,
    damagedFlowers,
    lawnFinishedPct: lawnPct,
    edgeFinishedPct: edgePct,
    canFinishWell,
    potentialRedirty: redirt.count,
    qualityBand,
  };
}
