import type { GardenDomain } from "@/game/garden/types";
import { countPotentialRedirty } from "@/game/garden/spatialRework";

export interface LearningAdvice {
  text: string;
  eventId?: string;
  areaId?: string;
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
  const redirt = countPotentialRedirty(domain);

  const reworkGather = [...domain.events]
    .reverse()
    .find((e) => e.type === "DEBRIS_GATHERED" && e.isRework);
  if (reworkGather && reworkGather.type === "DEBRIS_GATHERED") {
    advice.push({
      text: "You re-cleaned ground that had already been cleared after new clippings landed there.",
      eventId: reworkGather.id,
      areaId: "debris",
    });
  } else if (redirt.count > 0) {
    const spawn = [...domain.events]
      .reverse()
      .find((e) => e.type === "DEBRIS_SPAWNED" && e.kind === "clipping");
    advice.push({
      text: "New clippings landed on previously cleaned ground — a second cleanup would become spent rework.",
      eventId: spawn?.id,
      areaId: "debris",
    });
  }

  const topCut = domain.events.find((e) => e.type === "PLANT_TOP_CUT");
  if (topCut && ctx.weedsWithRoots > 0) {
    advice.push({
      text: "String trimmer cut tops only — roots still count until you pull them.",
      eventId: topCut.id,
      areaId: "flowerbed",
    });
  }

  const dmg = domain.events.find((e) => e.type === "ENVIRONMENT_DAMAGED");
  if (dmg && dmg.type === "ENVIRONMENT_DAMAGED") {
    advice.push({
      text: "An ornamental was damaged — that mark stays for this visit.",
      eventId: dmg.id,
      areaId: "flowerbed",
    });
  }

  if (ctx.lawnFinishedPct >= 70 && ctx.edgeFinishedPct < 40) {
    const edgeEv = domain.events.find((e) => e.type === "EDGE_WORKED");
    advice.push({
      text: "Open lawn can look done while the path edge is still ragged — edge work is separate.",
      eventId: edgeEv?.id,
      areaId: "edge",
    });
  }

  if (ctx.unresolvedHazards > 0) {
    const h = Object.values(domain.hazards).find((x) => !x.cleared);
    advice.push({
      text: "Unresolved hazards still block powered blades in their local area.",
      eventId: h ? `inspect:${h.id}` : undefined,
      areaId: "hazard",
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
    });
  }

  return advice.slice(0, 5);
}
