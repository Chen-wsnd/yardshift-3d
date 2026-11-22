import { describe, expect, it } from "vitest";
import { createFreshGardenDomain } from "./fixtures";
import {
  applyGardenEvent,
  gatherNearbyDebris,
} from "./reducer";
import { buildReviewSummary } from "./reviewSelectors";

describe("GardenDomain M1–M6 causality", () => {
  it("creates hedge clusters, plants, hazards, and initial debris", () => {
    const g = createFreshGardenDomain();
    expect(Object.keys(g.hedgeClusters).length).toBeGreaterThan(5);
    expect(Object.keys(g.plants).length).toBeGreaterThan(3);
    expect(Object.keys(g.hazards).length).toBeGreaterThan(0);
    expect(Object.keys(g.debris).length).toBeGreaterThan(0);
  });

  it("hedge cut spawns debris under the cluster (M2)", () => {
    const g0 = createFreshGardenDomain();
    const id = Object.keys(g0.hedgeClusters)[0];
    const c = g0.hedgeClusters[id];
    const g1 = applyGardenEvent(g0, {
      id: `hedge-cut:${id}:shears`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: id,
      effort: 0.55,
    });
    expect(g1.hedgeClusters[id].cut).toBe(true);
    const debris = Object.values(g1.debris).find(
      (d) => d.sourceActionId === `hedge-cut:${id}:shears`,
    );
    expect(debris).toBeTruthy();
    expect(debris!.kind).toBe("clipping");
    expect(Math.abs(debris!.x - c.x)).toBeLessThan(0.1);
    expect(debris!.z).toBeGreaterThan(c.z);
  });

  it("idempotent hedge cut does not double-spawn debris", () => {
    const g0 = createFreshGardenDomain();
    const id = Object.keys(g0.hedgeClusters)[0];
    const ev = {
      id: `hedge-cut:${id}:shears`,
      type: "HEDGE_CLUSTER_CUT" as const,
      clusterId: id,
      effort: 0.55,
    };
    const g1 = applyGardenEvent(g0, ev);
    const count1 = Object.keys(g1.debris).length;
    const g2 = applyGardenEvent(g1, ev);
    expect(Object.keys(g2.debris).length).toBe(count1);
  });

  it("rake gathers then bag removes debris; same-area re-clean after re-trim marks rework (M3)", () => {
    let g = createFreshGardenDomain();
    const east = Object.values(g.debris).find((d) =>
      d.id.startsWith("leaf-east"),
    )!;
    g = gatherNearbyDebris(g, east.x, east.z, 1.5, "rake-1");
    const gathered = Object.values(g.debris).filter((d) => d.state === "gathered");
    expect(gathered.length).toBeGreaterThan(0);
    g = applyGardenEvent(g, {
      id: "bag-1",
      type: "DEBRIS_BAGGED",
      debrisIds: gathered.map((d) => d.id),
      worldFootprint: { x: east.x, z: east.z, radius: 1.5 },
      effort: 0.4,
    });
    expect(g.debris[gathered[0].id].state).toBe("bagged");

    const near = Object.values(g.hedgeClusters).sort(
      (a, b) =>
        Math.hypot(a.x - east.x, a.z - east.z) -
        Math.hypot(b.x - east.x, b.z - east.z),
    )[0];
    g = applyGardenEvent(g, {
      id: `hedge-cut:${near.id}:late`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: near.id,
      effort: 0.5,
    });
    // Spawn after clean is potential only — spent rework needs a second cleanup
    expect(g.effort.rework).toBe(0);
    const clip = Object.values(g.debris).find(
      (d) => d.kind === "clipping" && d.state === "scattered",
    )!;
    g = gatherNearbyDebris(g, clip.x, clip.z, 1.5, "rake-2");
    const summary = buildReviewSummary(g);
    expect(summary.rework).toBeGreaterThan(0);
    expect(summary.reworkNotes.length).toBeGreaterThan(0);
  });

  it("hazard inspect then remove (M4)", () => {
    let g = createFreshGardenDomain();
    const hid = Object.keys(g.hazards)[0];
    g = applyGardenEvent(g, {
      id: `inspect:${hid}`,
      type: "INSPECTED",
      objectId: hid,
      effort: 0.3,
    });
    expect(g.inspection[hid].observed).toBe(true);
    g = applyGardenEvent(g, {
      id: `hazard-clear:${hid}`,
      type: "HAZARD_REMOVED",
      hazardId: hid,
      effort: 1,
    });
    expect(g.hazards[hid].cleared).toBe(true);
    expect(g.effort.setup).toBeGreaterThan(0);
  });

  it("root pull vs top cut (M5)", () => {
    let g = createFreshGardenDomain();
    const weed = Object.values(g.plants).find((p) => p.kind === "weed")!;
    g = applyGardenEvent(g, {
      id: `topcut:${weed.id}`,
      type: "PLANT_TOP_CUT",
      plantId: weed.id,
      effort: 0.3,
    });
    expect(g.plants[weed.id].topCut).toBe(true);
    expect(g.plants[weed.id].rootRemoved).toBe(false);

    g = applyGardenEvent(g, {
      id: `pull:${weed.id}`,
      type: "PLANT_ROOT_REMOVED",
      plantId: weed.id,
      effort: 0.8,
    });
    expect(g.plants[weed.id].rootRemoved).toBe(true);
    expect(
      Object.values(g.debris).some((d) => d.kind === "pulled_weed"),
    ).toBe(true);
  });

  it("flower damage is permanent (M5)", () => {
    let g = createFreshGardenDomain();
    const flower = Object.values(g.plants).find((p) => p.kind === "flower")!;
    g = applyGardenEvent(g, {
      id: `flower-dmg:${flower.id}`,
      type: "ENVIRONMENT_DAMAGED",
      targetId: flower.id,
      damageKind: "ornamental",
    });
    expect(g.plants[flower.id].ornamentalDamage).toBe(true);
  });

  it("review summary derives from events without fixed order penalty (M6)", () => {
    let g = createFreshGardenDomain();
    // Lawn-first then hedge (not "expert" order) — still no fixed penalty
    g = applyGardenEvent(g, {
      id: "work-lawn",
      type: "WORK_PERFORMED",
      taskId: "lawn",
      toolId: "lawn-mower",
      affectedIds: ["a"],
      effort: 2,
    });
    const hedgeId = Object.keys(g.hedgeClusters)[0];
    g = applyGardenEvent(g, {
      id: `hedge-cut:${hedgeId}:b`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: hedgeId,
      effort: 0.5,
    });
    const summary = buildReviewSummary(g);
    expect(summary.productive).toBeGreaterThan(0);
    // No bag yet → no rework from spawn-after-clean
    expect(summary.reworkNotes.every((n) => !n.includes("wrong order"))).toBe(
      true,
    );
  });

  it("recharge effort is recovery, not productive (M0)", () => {
    let g = createFreshGardenDomain();
    g = applyGardenEvent(g, {
      id: "recharge:lawn-mower:0",
      type: "TOOL_RECHARGED",
      toolId: "lawn-mower",
      effort: 1.5,
    });
    expect(g.effort.recovery).toBe(1.5);
    expect(g.effort.productive).toBe(0);
  });
});
