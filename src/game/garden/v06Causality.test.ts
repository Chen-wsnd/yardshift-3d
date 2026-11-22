import { describe, expect, it } from "vitest";
import { HEDGE_EAST_NODES, MEASURED_DANDELIONS } from "@/data/gardenPlacement";
import { createFreshGardenDomain } from "./fixtures";
import { applyGardenEvent, gatherNearbyDebris } from "./reducer";
import { buildReviewSummary } from "./reviewSelectors";

describe("v06 causality matrix (atlas G2)", () => {
  it("region-placement-invariant: hedge clusters near measured east nodes", () => {
    const g = createFreshGardenDomain();
    const xs = Object.values(g.hedgeClusters).map((c) => c.x);
    const zs = Object.values(g.hedgeClusters).map((c) => c.z);
    expect(Math.min(...xs)).toBeGreaterThan(5.5);
    expect(Math.max(...xs)).toBeLessThan(7.2);
    expect(Math.min(...zs)).toBeGreaterThan(-4);
    expect(Math.max(...zs)).toBeLessThan(8);
    for (const node of HEDGE_EAST_NODES) {
      const near = Object.values(g.hedgeClusters).some(
        (c) => Math.hypot(c.x - (node.center[0] - 0.65), c.z - node.center[2]) < 1.2,
      );
      expect(near).toBe(true);
    }
  });

  it("one-source-one-debris-event: duplicate hedge cut is idempotent", () => {
    let g = createFreshGardenDomain();
    const id = Object.keys(g.hedgeClusters)[0];
    const ev = {
      id: `hedge-cut:${id}:once`,
      type: "HEDGE_CLUSTER_CUT" as const,
      clusterId: id,
      effort: 0.5,
    };
    g = applyGardenEvent(g, ev);
    const n1 = Object.keys(g.debris).length;
    g = applyGardenEvent(g, ev);
    expect(Object.keys(g.debris).length).toBe(n1);
  });

  it("hedge-clean-then-redirty: bag then new cut yields rework notes", () => {
    let g = createFreshGardenDomain();
    const a = Object.keys(g.hedgeClusters)[0];
    const b = Object.keys(g.hedgeClusters)[1];
    g = applyGardenEvent(g, {
      id: `hedge-cut:${a}`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: a,
      effort: 0.5,
    });
    const clip = Object.values(g.debris).find((d) => d.kind === "clipping")!;
    g = gatherNearbyDebris(g, clip.x, clip.z, 2, "rake-a");
    const gathered = Object.values(g.debris)
      .filter((d) => d.state === "gathered")
      .map((d) => d.id);
    g = applyGardenEvent(g, {
      id: "bag-a",
      type: "DEBRIS_BAGGED",
      debrisIds: gathered,
    });
    g = applyGardenEvent(g, {
      id: `hedge-cut:${b}`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: b,
      effort: 0.5,
    });
    const summary = buildReviewSummary(g);
    expect(summary.rework).toBeGreaterThan(0);
  });

  it("rake-vs-blower-vectors: blow moves debris along direction", () => {
    let g = createFreshGardenDomain();
    const leaf = Object.values(g.debris).find((d) => d.kind === "leaf")!;
    const before = { x: leaf.x, z: leaf.z };
    g = applyGardenEvent(g, {
      id: "blow-1",
      type: "DEBRIS_MOVED",
      debrisId: leaf.id,
      x: before.x + 1.2,
      z: before.z,
    });
    expect(g.debris[leaf.id].x).toBeGreaterThan(before.x + 0.5);
  });

  it("bag-locality: only gathered nearby piles bag", () => {
    let g = createFreshGardenDomain();
    const leaf = Object.values(g.debris)[0];
    g = applyGardenEvent(g, {
      id: "bag-far",
      type: "DEBRIS_BAGGED",
      debrisIds: [leaf.id],
    });
    // scattered cannot bag via event that requires gathered state
    expect(g.debris[leaf.id].state).not.toBe("bagged");
  });

  it("plant-root-vs-top: measured weeds retain root after top cut", () => {
    let g = createFreshGardenDomain();
    const weedId = MEASURED_DANDELIONS[0].id;
    expect(g.plants[weedId]).toBeTruthy();
    g = applyGardenEvent(g, {
      id: `top:${weedId}`,
      type: "PLANT_TOP_CUT",
      plantId: weedId,
      effort: 0.3,
    });
    expect(g.plants[weedId].topCut).toBe(true);
    expect(g.plants[weedId].rootRemoved).toBe(false);
  });

  it("plan-not-authoritative: revising plan does not block work", () => {
    let g = createFreshGardenDomain();
    g = applyGardenEvent(g, {
      id: "plan-1",
      type: "PLAN_REVISED",
      orderedTaskIds: ["debris", "lawn", "hedge"],
    });
    const hedgeId = Object.keys(g.hedgeClusters)[0];
    g = applyGardenEvent(g, {
      id: `hedge-cut:${hedgeId}:anyway`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: hedgeId,
      effort: 0.5,
    });
    expect(g.hedgeClusters[hedgeId].cut).toBe(true);
    expect(g.plan.taskOrder[0]).toBe("debris");
  });

  it("review-derived-from-actual-events: A vs B rework differs without order penalty", () => {
    // Path A: hedge then clean once
    let a = createFreshGardenDomain();
    const h1 = Object.keys(a.hedgeClusters)[0];
    a = applyGardenEvent(a, {
      id: "a-cut",
      type: "HEDGE_CLUSTER_CUT",
      clusterId: h1,
      effort: 0.5,
    });
    const clipA = Object.values(a.debris).find((d) => d.kind === "clipping")!;
    a = gatherNearbyDebris(a, clipA.x, clipA.z, 2, "a-rake");
    const idsA = Object.values(a.debris)
      .filter((d) => d.state === "gathered")
      .map((d) => d.id);
    a = applyGardenEvent(a, {
      id: "a-bag",
      type: "DEBRIS_BAGGED",
      debrisIds: idsA,
    });

    // Path B: clean first (initial leaves), then hedge → rework
    let b = createFreshGardenDomain();
    const leaf = Object.values(b.debris).find((d) => d.kind === "leaf")!;
    b = gatherNearbyDebris(b, leaf.x, leaf.z, 3, "b-rake");
    const idsB = Object.values(b.debris)
      .filter((d) => d.state === "gathered")
      .map((d) => d.id);
    b = applyGardenEvent(b, {
      id: "b-bag",
      type: "DEBRIS_BAGGED",
      debrisIds: idsB,
    });
    const h2 = Object.keys(b.hedgeClusters)[0];
    b = applyGardenEvent(b, {
      id: "b-cut",
      type: "HEDGE_CLUSTER_CUT",
      clusterId: h2,
      effort: 0.5,
    });

    const sumA = buildReviewSummary(a);
    const sumB = buildReviewSummary(b);
    expect(sumB.rework).toBeGreaterThan(sumA.rework);
    expect(
      sumB.reworkNotes.some((n) => n.toLowerCase().includes("wrong order")),
    ).toBe(false);
  });
});
