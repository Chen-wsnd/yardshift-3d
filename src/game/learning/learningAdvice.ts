import type { GardenDomain } from "@/game/garden/types";
import { countPotentialRedirty } from "@/game/garden/spatialRework";

export interface LearningAdvice {
  text: string;
  /** Only set when a real sealed/history event backs the tip (P1-05). */
  eventId?: string;
  areaId?: string;
  sourceType?: "event" | "current-state";
  entityId?: string;
}

export interface AdviceContext {
  weedsWithRoots: number;
  lawnFinishedPct: number;
  edgeFinishedPct: number;
  unresolvedHazards: number;
}

/** Event-backed suggestions — never a fixed expert order penalty. */
export function buildLearningAdvice(
  domain: GardenDomain,
  ctx: AdviceContext,
): LearningAdvice[] {
  const advice: LearningAdvice[] = [];
  const eventIds = new Set(domain.events.map((e) => e.id));
  const redirt = countPotentialRedirty(domain);

  const reworkGather = [...domain.events]
    .reverse()
    .find((e) => e.type === "DEBRIS_GATHERED" && e.isRework);
  if (reworkGather && reworkGather.type === "DEBRIS_GATHERED") {
    advice.push({
      text: "You re-cleaned ground that had already been cleared after new clippings landed there.",
      eventId: reworkGather.id,
      areaId: "debris",
      sourceType: "event",
    });
  } else if (redirt.spawnEventIds.length > 0) {
    // Point at a spawn that truly overlapped prior cleanup — not the last clipping anywhere
    const spawnId = redirt.spawnEventIds[redirt.spawnEventIds.length - 1]!;
    advice.push({
      text: "New clippings landed on previously cleaned ground — a second cleanup would become spent rework.",
      eventId: eventIds.has(spawnId) ? spawnId : undefined,
      areaId: "debris",
      sourceType: "event",
    });
  }

  const topCut = domain.events.find((e) => e.type === "PLANT_TOP_CUT");
  if (topCut && ctx.weedsWithRoots > 0) {
    advice.push({
      text: "String trimmer cut tops only — roots still count until you pull them.",
      eventId: topCut.id,
      areaId: "flowerbed",
      sourceType: "event",
    });
  }

  const dmg = domain.events.find((e) => e.type === "ENVIRONMENT_DAMAGED");
  if (dmg && dmg.type === "ENVIRONMENT_DAMAGED") {
    advice.push({
      text: "An ornamental was damaged — that mark stays for this visit.",
      eventId: dmg.id,
      areaId: "flowerbed",
      sourceType: "event",
    });
  }

  if (ctx.lawnFinishedPct >= 70 && ctx.edgeFinishedPct < 40) {
    const edgeEv = domain.events.find((e) => e.type === "EDGE_WORKED");
    advice.push({
      text: "Open lawn can look done while the path edge is still ragged — edge work is separate.",
      eventId: edgeEv?.id,
      areaId: "edge",
      sourceType: edgeEv ? "event" : "current-state",
    });
  }

  if (ctx.unresolvedHazards > 0) {
    const h = Object.values(domain.hazards).find((x) => !x.cleared);
    // No fake inspect:… eventId — this is live state advice (P1-05)
    advice.push({
      text: "Unresolved hazards still block powered blades in their local area.",
      areaId: "hazard",
      sourceType: "current-state",
      entityId: h?.id,
    });
  }

  const overcut = domain.events.find(
    (e) => e.type === "HEDGE_CLUSTER_CUT" && e.overcut,
  );
  if (overcut) {
    advice.push({
      text: "An overcut notch will not heal by dragging again — it is a lasting quality mark.",
      eventId: overcut.id,
      areaId: "hedge",
      sourceType: "event",
    });
  }

  return advice.slice(0, 5);
}
