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
  unresolvedHazards: number;
  uncutHedge: number;
  looseDebris: number;
  weedsWithRoots: number;
  damagedFlowers: number;
  canFinishWell: boolean;
}

/**
 * Derive review metrics from real events — no fixed wrong-order penalty.
 * Rework = extra cleanup after a region was already cleaned (DEBRIS_SPAWNED after bag/gather).
 */
export function buildReviewSummary(domain: GardenDomain): ReviewSummary {
  const e = domain.effort;
  const total =
    e.productive + e.setup + e.rework + e.ineffective + e.recovery;

  const cleanedThenDirtied: string[] = [];
  const bagOrGatherTimes = new Map<string, number>();
  // Approximate spatial cells that were cleaned
  let cleanEvents = 0;
  let spawnAfterClean = 0;
  for (const ev of domain.events) {
    if (ev.type === "DEBRIS_BAGGED" || ev.type === "DEBRIS_GATHERED") {
      cleanEvents++;
      bagOrGatherTimes.set(ev.id, domain.events.indexOf(ev));
    }
    if (ev.type === "DEBRIS_SPAWNED" && ev.kind === "clipping") {
      // If any bag/gather happened before this spawn → rework signal
      const priorClean = domain.events
        .slice(0, domain.events.indexOf(ev))
        .some(
          (x) => x.type === "DEBRIS_BAGGED" || x.type === "DEBRIS_GATHERED",
        );
      if (priorClean) {
        spawnAfterClean++;
        cleanedThenDirtied.push(
          `Clippings fell at (${ev.x.toFixed(1)}, ${ev.z.toFixed(1)}) after you had already cleaned.`,
        );
      }
    }
  }

  const rework =
    e.rework + spawnAfterClean * 1.2; // event-derived rework units

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
    (p) => p.kind === "weed" && !p.rootRemoved,
  ).length;
  const damagedFlowers = Object.values(domain.plants).filter(
    (p) => p.kind === "flower" && p.ornamentalDamage,
  ).length;

  const qualityNotes: string[] = [];
  if (uncutHedge > 0) qualityNotes.push(`${uncutHedge} hedge clusters still overgrown.`);
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

  const reworkNotes = [...cleanedThenDirtied];
  if (spawnAfterClean > 0) {
    reworkNotes.unshift(
      `You cleaned once, then new clippings appeared ${spawnAfterClean} time(s) — that is real rework.`,
    );
  }
  if (cleanEvents > 1 && spawnAfterClean === 0) {
    reworkNotes.push(
      `Multiple gather/bag actions (${cleanEvents}) — check whether the same area was worked twice.`,
    );
  }

  const canFinishWell =
    unresolvedHazards === 0 &&
    uncutHedge <= 2 &&
    weedsWithRoots <= 1 &&
    looseDebris <= 4;

  return {
    productive: e.productive,
    setup: e.setup,
    rework,
    ineffective: e.ineffective,
    recovery: e.recovery,
    total: total + spawnAfterClean * 1.2 - e.rework + e.rework,
    qualityNotes,
    reworkNotes,
    unresolvedHazards,
    uncutHedge,
    looseDebris,
    weedsWithRoots,
    damagedFlowers,
    canFinishWell,
  };
}
