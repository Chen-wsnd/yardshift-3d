import { FIXTURE_VERSION } from "./toolKnowledge";
import { buildReviewSummary } from "@/game/garden/reviewSelectors";
import type { GardenDomain } from "@/game/garden/types";
import type { WorkSnapshot } from "@/game/work/types";

export type QualityBand = "incomplete" | "acceptable" | "needs-attention";

export interface VisitKeyEvent {
  eventId: string;
  explanationCode: string;
  areaId?: string;
}

export interface VisitSummary {
  id: string;
  fixtureVersion: string;
  finishedAtActionIndex: number;
  final: {
    lawnPct: number;
    edgePct: number;
    hedgeRemaining: number;
    weedsWithRoots: number;
    looseDebris: number;
    hazardsUncleared: number;
    ornamentalDamage: number;
  };
  effort: {
    productive: number;
    setup: number;
    rework: number;
    ineffective: number;
    recovery: number;
    total: number;
  };
  toolsUsed: string[];
  keyEvents: VisitKeyEvent[];
  qualityBand: QualityBand;
}

function qualityBandFrom(
  domain: GardenDomain,
  work: WorkSnapshot | undefined,
): QualityBand {
  const s = buildReviewSummary(domain, work);
  if (s.damagedFlowers > 0 || s.unresolvedHazards > 0) return "needs-attention";
  if (!s.canFinishWell) return "incomplete";
  return "acceptable";
}

function pickKeyEvents(domain: GardenDomain): VisitKeyEvent[] {
  const out: VisitKeyEvent[] = [];
  for (const ev of domain.events) {
    if (ev.type === "HAZARD_REMOVED") {
      out.push({
        eventId: ev.id,
        explanationCode: "hazard-cleared",
        areaId: "hazard",
      });
    } else if (ev.type === "HEDGE_CLUSTER_CUT") {
      out.push({
        eventId: ev.id,
        explanationCode: ev.overcut ? "hedge-overcut" : "hedge-cut",
        areaId: "hedge",
      });
    } else if (ev.type === "DEBRIS_GATHERED" && ev.isRework) {
      out.push({
        eventId: ev.id,
        explanationCode: "rework-cleanup",
        areaId: "debris",
      });
    } else if (ev.type === "PLANT_TOP_CUT") {
      out.push({
        eventId: ev.id,
        explanationCode: "tops-only",
        areaId: "flowerbed",
      });
    } else if (ev.type === "ENVIRONMENT_DAMAGED") {
      out.push({
        eventId: ev.id,
        explanationCode: "ornamental-damage",
        areaId: "flowerbed",
      });
    } else if (ev.type === "EDGE_WORKED") {
      out.push({
        eventId: ev.id,
        explanationCode: "edge-worked",
        areaId: "edge",
      });
    }
  }
  // Keep a readable handful
  return out.slice(-12);
}

function toolsUsed(domain: GardenDomain): string[] {
  const ids = new Set<string>();
  for (const ev of domain.events) {
    if ("toolId" in ev && typeof (ev as { toolId?: string }).toolId === "string") {
      ids.add((ev as { toolId: string }).toolId);
    }
  }
  return [...ids];
}

/** Pure: seal a visit from current garden + lawn snapshot. */
export function buildVisitSummary(
  domain: GardenDomain,
  work: WorkSnapshot | undefined,
  id: string,
): VisitSummary {
  const s = buildReviewSummary(domain, work);
  return {
    id,
    fixtureVersion: FIXTURE_VERSION,
    finishedAtActionIndex: domain.events.length,
    final: {
      lawnPct: s.lawnFinishedPct,
      edgePct: s.edgeFinishedPct,
      hedgeRemaining: s.uncutHedge,
      weedsWithRoots: s.weedsWithRoots,
      looseDebris: s.looseDebris,
      hazardsUncleared: s.unresolvedHazards,
      ornamentalDamage: s.damagedFlowers,
    },
    effort: {
      productive: s.productive,
      setup: s.setup,
      rework: s.rework,
      ineffective: s.ineffective,
      recovery: s.recovery,
      total: s.total,
    },
    toolsUsed: toolsUsed(domain),
    keyEvents: pickKeyEvents(domain),
    qualityBand: qualityBandFrom(domain, work),
  };
}

export function comparableCoverage(
  a: VisitSummary,
  b: VisitSummary,
): boolean {
  if (a.fixtureVersion !== b.fixtureVersion) return false;
  const close = (x: number, y: number, tol: number) => Math.abs(x - y) <= tol;
  return (
    close(a.final.lawnPct, b.final.lawnPct, 8) &&
    close(a.final.edgePct, b.final.edgePct, 8) &&
    a.final.hedgeRemaining === b.final.hedgeRemaining &&
    a.final.weedsWithRoots === b.final.weedsWithRoots &&
    a.final.hazardsUncleared === b.final.hazardsUncleared &&
    a.final.ornamentalDamage === b.final.ornamentalDamage &&
    Math.abs(a.final.looseDebris - b.final.looseDebris) <= 2
  );
}

export interface VisitCompareResult {
  comparable: boolean;
  reason: string;
  effortDelta?: number;
  reworkDelta?: number;
  notes: string[];
}

export function compareVisits(
  previous: VisitSummary | undefined,
  current: VisitSummary,
): VisitCompareResult {
  if (!previous) {
    return {
      comparable: false,
      reason: "No prior sealed visit to compare.",
      notes: [],
    };
  }
  if (previous.fixtureVersion !== current.fixtureVersion) {
    return {
      comparable: false,
      reason: "Fixture versions differ — do not compare efficiency.",
      notes: [],
    };
  }
  // Safety / damage first
  if (
    current.final.ornamentalDamage !== previous.final.ornamentalDamage ||
    current.final.hazardsUncleared !== previous.final.hazardsUncleared
  ) {
    return {
      comparable: false,
      reason:
        "Safety or ornamental damage differs — compare quality first, not speed.",
      notes: [
        `Prior damage ${previous.final.ornamentalDamage}, hazards ${previous.final.hazardsUncleared}.`,
        `This visit damage ${current.final.ornamentalDamage}, hazards ${current.final.hazardsUncleared}.`,
      ],
    };
  }
  if (!comparableCoverage(previous, current)) {
    return {
      comparable: false,
      reason:
        "Final coverage/quality differs — cannot fairly compare efficiency.",
      notes: [
        `Prior lawn ${Math.round(previous.final.lawnPct)}% / edge ${Math.round(previous.final.edgePct)}%.`,
        `This lawn ${Math.round(current.final.lawnPct)}% / edge ${Math.round(current.final.edgePct)}%.`,
      ],
    };
  }
  const effortDelta = current.effort.total - previous.effort.total;
  const reworkDelta = current.effort.rework - previous.effort.rework;
  const notes: string[] = [];
  if (Math.abs(reworkDelta) > 0.05) {
    notes.push(
      reworkDelta > 0
        ? `This visit spent ${reworkDelta.toFixed(1)} more rework effort (same-area second cleanups).`
        : `This visit spent ${(-reworkDelta).toFixed(1)} less rework effort.`,
    );
  }
  if (Math.abs(effortDelta) > 0.05) {
    notes.push(
      effortDelta > 0
        ? `Total game-modeled effort was ${effortDelta.toFixed(1)} higher.`
        : `Total game-modeled effort was ${(-effortDelta).toFixed(1)} lower.`,
    );
  }
  const toolDiff = current.toolsUsed.filter((t) => !previous.toolsUsed.includes(t));
  if (toolDiff.length) {
    notes.push(`Different tools used this time: ${toolDiff.join(", ")}.`);
  }
  return {
    comparable: true,
    reason: "Same fixture and similar final quality — effort differences are meaningful.",
    effortDelta,
    reworkDelta,
    notes,
  };
}
