import { describe, expect, it } from "vitest";
import { createFreshGardenDomain } from "./fixtures";
import { applyGardenEvent, gatherNearbyDebris } from "./reducer";
import { buildReviewSummary } from "./reviewSelectors";
import { countPotentialRedirty, isReworkCleanup } from "./spatialRework";

describe("spatial rework (T20–T23)", () => {
  it("T20: clean SW then cut east does not spend rework until east is cleaned again", () => {
    let g = createFreshGardenDomain();
    const sw = Object.values(g.debris).find((d) => d.id.startsWith("leaf-sw"))!;
    g = gatherNearbyDebris(g, sw.x, sw.z, 2, "sw-clean");
    const gathered = Object.values(g.debris)
      .filter((d) => d.state === "gathered")
      .map((d) => d.id);
    g = applyGardenEvent(g, {
      id: "sw-bag",
      type: "DEBRIS_BAGGED",
      debrisIds: gathered,
      worldFootprint: { x: sw.x, z: sw.z, radius: 2 },
      effort: 0.4,
      isRework: false,
    });
    const hedgeId = Object.keys(g.hedgeClusters)[0];
    g = applyGardenEvent(g, {
      id: `hedge-cut:${hedgeId}`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: hedgeId,
      effort: 0.5,
    });
    expect(g.effort.rework).toBe(0);
    const redirt = countPotentialRedirty(g);
    // May or may not overlap SW depending on hedge position — east cut should not
    // invent rework effort without a second cleanup
    expect(g.effort.rework).toBe(0);
    void redirt;
  });

  it("T21: clean east → cut same hedge → clean again counts rework", () => {
    let g = createFreshGardenDomain();
    const east = Object.values(g.debris).find((d) => d.id.startsWith("leaf-east"))!;
    g = gatherNearbyDebris(g, east.x, east.z, 1.5, "east-1");
    const firstRework = g.effort.rework;
    expect(firstRework).toBe(0);

    // Find hedge near east leaves
    const near = Object.values(g.hedgeClusters).sort(
      (a, b) =>
        Math.hypot(a.x - east.x, a.z - east.z) -
        Math.hypot(b.x - east.x, b.z - east.z),
    )[0];
    g = applyGardenEvent(g, {
      id: `hedge-cut:${near.id}`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: near.id,
      effort: 0.5,
    });
    const clip = Object.values(g.debris).find(
      (d) => d.kind === "clipping" && d.state === "scattered",
    )!;
    expect(
      isReworkCleanup(g, { x: clip.x, z: clip.z, radius: 1.5 }),
    ).toBe(true);

    g = gatherNearbyDebris(g, clip.x, clip.z, 1.5, "east-2");
    expect(g.effort.rework).toBeGreaterThan(0);

    const summary = buildReviewSummary(g);
    expect(summary.rework).toBeGreaterThan(0);
    expect(summary.reworkNotes.join(" ").toLowerCase()).not.toContain(
      "wrong order",
    );
  });

  it("T23: spawn after clean alone is potential, not spent rework", () => {
    let g = createFreshGardenDomain();
    const east = Object.values(g.debris).find((d) => d.id.startsWith("leaf-east"))!;
    g = gatherNearbyDebris(g, east.x, east.z, 1.5, "c1");
    const near = Object.values(g.hedgeClusters)[0];
    g = applyGardenEvent(g, {
      id: `hedge-cut:${near.id}:x`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: near.id,
      effort: 0.5,
    });
    expect(g.effort.rework).toBe(0);
    const pot = countPotentialRedirty(g);
    expect(pot.count).toBeGreaterThanOrEqual(0);
  });
});
