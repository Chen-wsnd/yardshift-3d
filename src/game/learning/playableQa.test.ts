/**
 * Q-matrix additions for playable learning QA (strict assertions).
 */
import { beforeEach, describe, expect, it } from "vitest";
import { createFreshGardenDomain } from "@/game/garden/fixtures";
import {
  applyGardenEvent,
  gatherNearbyDebris,
} from "@/game/garden/reducer";
import { countPotentialRedirty } from "@/game/garden/spatialRework";
import { pathLength } from "@/game/work/lawnSweep";
import { useGameStore } from "@/game/store/gameStore";
import {
  buildVisitSummary,
  compareVisits,
} from "./visitSummary";

describe("playable QA Q-matrix", () => {
  beforeEach(() => {
    useGameStore.getState().startV03Garden();
  });

  it("Q10: pathLength is sample-count stable for same endpoints", () => {
    const a = { x: 0, z: 0 };
    const b = { x: 3, z: 0 };
    const coarse = [a, { x: 1.5, z: 0 }, b];
    const fine: { x: number; z: number }[] = [a];
    for (let i = 1; i <= 16; i++) fine.push({ x: (3 * i) / 16, z: 0 });
    expect(Math.abs(pathLength(coarse) - pathLength(fine))).toBeLessThan(0.05);
  });

  it("Q16: same hedge cluster cut twice yields one clipping spawn", () => {
    let g = createFreshGardenDomain();
    const id = Object.keys(g.hedgeClusters)[0]!;
    g = applyGardenEvent(g, {
      id: `hedge-cut:${id}:once`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: id,
      effort: 0.5,
    });
    const after1 = Object.values(g.debris).filter((d) => d.kind === "clipping")
      .length;
    g = applyGardenEvent(g, {
      id: `hedge-cut:${id}:twice`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: id,
      effort: 0.5,
    });
    const after2 = Object.values(g.debris).filter((d) => d.kind === "clipping")
      .length;
    expect(after2).toBe(after1);
  });

  it("Q22 vs Q23: SW clean+east cut rework=0; east clean+cut+reclean rework>0", () => {
    // Path A
    let a = createFreshGardenDomain();
    const sw = Object.values(a.debris).find((d) => d.id.startsWith("leaf-sw"))!;
    a = gatherNearbyDebris(a, sw.x, sw.z, 2, "a-sw");
    const eastA = Object.values(a.debris).find((d) =>
      d.id.startsWith("leaf-east"),
    )!;
    const hA = Object.values(a.hedgeClusters).sort(
      (x, y) =>
        Math.hypot(x.x - eastA.x, x.z - eastA.z) -
        Math.hypot(y.x - eastA.x, y.z - eastA.z),
    )[0]!;
    a = applyGardenEvent(a, {
      id: `a-cut:${hA.id}`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: hA.id,
      effort: 0.5,
    });
    expect(a.effort.rework).toBe(0);

    // Path B
    let b = createFreshGardenDomain();
    const east = Object.values(b.debris).find((d) =>
      d.id.startsWith("leaf-east"),
    )!;
    b = gatherNearbyDebris(b, east.x, east.z, 1.5, "b1");
    const ids = Object.values(b.debris)
      .filter((d) => d.state === "gathered")
      .map((d) => d.id);
    b = applyGardenEvent(b, {
      id: "b-bag",
      type: "DEBRIS_BAGGED",
      debrisIds: ids,
      worldFootprint: { x: east.x, z: east.z, radius: 1.5 },
      effort: 0.4,
    });
    const hB = Object.values(b.hedgeClusters).sort(
      (x, y) =>
        Math.hypot(x.x - east.x, x.z - east.z) -
        Math.hypot(y.x - east.x, y.z - east.z),
    )[0]!;
    b = applyGardenEvent(b, {
      id: `b-cut:${hB.id}`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: hB.id,
      effort: 0.5,
    });
    expect(b.effort.rework).toBe(0);
    expect(countPotentialRedirty(b).count).toBeGreaterThan(0);
    const clip = Object.values(b.debris).find(
      (d) => d.kind === "clipping" && d.state === "scattered",
    )!;
    b = gatherNearbyDebris(b, clip.x, clip.z, 1.5, "b2");
    expect(b.effort.rework).toBeGreaterThan(0);
    expect(b.effort.rework).toBeGreaterThan(a.effort.rework);
  });

  it("Q28: finish twice seals once; further cut blocked", () => {
    useGameStore.getState().finishVisit();
    const n1 = useGameStore.getState().work.garden!.visitHistory.length;
    useGameStore.getState().finishVisit();
    const n2 = useGameStore.getState().work.garden!.visitHistory.length;
    expect(n2).toBe(n1);
    expect(useGameStore.getState().work.garden!.visitFinished).toBe(true);

    const id = Object.keys(
      useGameStore.getState().work.garden!.hedgeClusters,
    )[0]!;
    const before =
      useGameStore.getState().work.garden!.hedgeClusters[id]!.cut;
    useGameStore.getState().cutHedgeCluster(id, "hand-hedge-shears");
    expect(
      useGameStore.getState().work.garden!.hedgeClusters[id]!.cut,
    ).toBe(before);
    expect(useGameStore.getState().work.lastEvents[0]?.id).toBe("visit-sealed");
  });

  it("Q27: empty finish is not acceptable", () => {
    useGameStore.getState().finishVisit();
    const sealed = useGameStore.getState().work.garden!.visitHistory[0]!;
    expect(sealed.qualityBand).not.toBe("acceptable");
  });

  it("Q30/Q31: compare only when quality matches", () => {
    const work = useGameStore.getState().work;
    const g = work.garden!;
    const a = buildVisitSummary(g, work, "a");
    const bBad = buildVisitSummary(
      {
        ...g,
        plants: {
          ...g.plants,
          "flower-0": { ...g.plants["flower-0"]!, ornamentalDamage: true },
        },
      },
      work,
      "b",
    );
    expect(compareVisits(a, bBad).comparable).toBe(false);

    const bOk = buildVisitSummary(
      {
        ...g,
        effort: { ...g.effort, rework: 1.5, productive: g.effort.productive + 1 },
      },
      work,
      "c",
    );
    const cmp = compareVisits(a, bOk);
    expect(cmp.comparable).toBe(true);
    expect(cmp.reworkDelta).toBeCloseTo(1.5);
  });
});
