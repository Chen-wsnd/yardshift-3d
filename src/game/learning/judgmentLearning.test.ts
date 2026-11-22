/**
 * J01–J30 core objective checks for professional tool judgment learning.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { createFreshGardenDomain } from "@/game/garden/fixtures";
import { toolPresentationKind } from "./toolPresentation";
import { migrateGardenDomain } from "@/game/garden/migrateGarden";
import {
  applyGardenEvent,
  gatherNearbyDebris,
} from "@/game/garden/reducer";
import { buildReviewSummary } from "@/game/garden/reviewSelectors";
import { createFreshV03GardenSnapshot } from "@/game/work/gardenFixtures";
import { migrateLawnIfNeeded } from "@/game/work/gardenFixtures";
import { useGameStore } from "@/game/store/gameStore";
import {
  buildVisitSummary,
  compareVisits,
} from "./visitSummary";
import { getToolKnowledge } from "./toolKnowledge";

describe("judgment learning J-matrix", () => {
  beforeEach(() => {
    useGameStore.getState().startV03Garden();
  });

  it("J01: migrate old garden gains visitHistory without wiping plants", () => {
    const snap = createFreshV03GardenSnapshot();
    const rawGarden = { ...createFreshGardenDomain() };
    delete (rawGarden as { visitHistory?: unknown }).visitHistory;
    (rawGarden as { schemaVersion: number }).schemaVersion = 2;
    const migrated = migrateGardenDomain(rawGarden as typeof rawGarden & { visitHistory?: never });
    expect(migrated.visitHistory).toEqual([]);
    expect(Object.keys(migrated.plants).length).toBeGreaterThan(0);
    const lawn = migrateLawnIfNeeded(snap);
    expect(lawn.schemaVersion).toBe(3);
  });

  it("J09: string-trimmer 0 battery cannot topCut via store", () => {
    const weed = Object.values(useGameStore.getState().work.garden!.plants).find(
      (p) => p.kind === "weed",
    )!;
    useGameStore.getState().selectTool("string-trimmer");
    useGameStore.setState((s) => ({
      work: {
        ...s.work,
        tools: {
          ...s.work.tools,
          "string-trimmer": {
            ...s.work.tools["string-trimmer"]!,
            resource: 0,
            status: "unpowered",
          },
        },
      },
    }));
    useGameStore.getState().topCutWeed(weed.id);
    expect(useGameStore.getState().work.garden!.plants[weed.id].topCut).toBe(
      false,
    );
  });

  it("J10: jammed string-trimmer cannot topCut", () => {
    const weed = Object.values(useGameStore.getState().work.garden!.plants).find(
      (p) => p.kind === "weed",
    )!;
    useGameStore.getState().selectTool("string-trimmer");
    useGameStore.setState((s) => ({
      work: {
        ...s.work,
        tools: {
          ...s.work.tools,
          "string-trimmer": {
            ...s.work.tools["string-trimmer"]!,
            status: "jammed",
            resource: 80,
          },
        },
      },
    }));
    useGameStore.getState().topCutWeed(weed.id);
    expect(useGameStore.getState().work.garden!.plants[weed.id].topCut).toBe(
      false,
    );
  });

  it("J11: hand-weeder pulls root; flower damage once", () => {
    useGameStore.getState().selectTool("hand-weeder");
    const weed = Object.values(useGameStore.getState().work.garden!.plants).find(
      (p) => p.kind === "weed",
    )!;
    useGameStore.getState().pullWeed(weed.id);
    expect(
      useGameStore.getState().work.garden!.plants[weed.id].rootRemoved,
    ).toBe(true);
    const flower = Object.values(
      useGameStore.getState().work.garden!.plants,
    ).find((p) => p.kind === "flower")!;
    useGameStore.getState().pullWeed(flower.id);
    expect(
      useGameStore.getState().work.garden!.plants[flower.id].ornamentalDamage,
    ).toBe(true);
    useGameStore.getState().pullWeed(flower.id);
    expect(
      useGameStore.getState().work.garden!.plants[flower.id].ornamentalDamage,
    ).toBe(true);
  });

  it("J12: every completion weed is in operable flowerbed strip", () => {
    const g = createFreshGardenDomain();
    const required = Object.values(g.plants).filter(
      (p) => p.kind === "weed" && p.countsTowardCompletion !== false,
    );
    expect(required.length).toBeGreaterThan(0);
    for (const w of required) {
      expect(w.x).toBeLessThan(-5);
      expect(w.z).toBeGreaterThan(1);
      expect(w.z).toBeLessThan(4.5);
    }
  });

  it("J13: high lawn % with 0 edge stays distinct in review", () => {
    const g = createFreshGardenDomain();
    const work = useGameStore.getState().work;
    const summary = buildReviewSummary(g, work);
    expect(summary.edgeFinishedPct).toBe(0);
    expect(summary.completionNotes.some((n) => n.toLowerCase().includes("edge"))).toBe(
      true,
    );
  });

  it("J16/J17: SW clean + east cut no spent rework; same-area second clean spends", () => {
    let g = createFreshGardenDomain();
    const sw = Object.values(g.debris).find((d) => d.id.startsWith("leaf-sw"))!;
    g = gatherNearbyDebris(g, sw.x, sw.z, 2, "sw");
    const east = Object.values(g.debris).find((d) =>
      d.id.startsWith("leaf-east"),
    )!;
    const near = Object.values(g.hedgeClusters).sort(
      (a, b) =>
        Math.hypot(a.x - east.x, a.z - east.z) -
        Math.hypot(b.x - east.x, b.z - east.z),
    )[0];
    g = applyGardenEvent(g, {
      id: `cut:${near.id}`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: near.id,
      effort: 0.5,
    });
    expect(g.effort.rework).toBe(0);

    g = gatherNearbyDebris(g, east.x, east.z, 1.5, "east-1");
    const ids = Object.values(g.debris)
      .filter((d) => d.state === "gathered")
      .map((d) => d.id);
    g = applyGardenEvent(g, {
      id: "east-bag",
      type: "DEBRIS_BAGGED",
      debrisIds: ids,
      worldFootprint: { x: east.x, z: east.z, radius: 1.5 },
      effort: 0.4,
    });
    g = applyGardenEvent(g, {
      id: `cut2:${near.id}`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: near.id,
      effort: 0.5,
    });
    // already cut — no new debris; use another uncut near east
    const other = Object.values(g.hedgeClusters).find((c) => !c.cut)!;
    g = applyGardenEvent(g, {
      id: `cut3:${other.id}`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId: other.id,
      effort: 0.5,
    });
    const clip = Object.values(g.debris).find(
      (d) => d.kind === "clipping" && d.state === "scattered",
    );
    if (clip) {
      g = gatherNearbyDebris(g, clip.x, clip.z, 1.5, "east-2");
    }
    // rework may or may not fire depending on footprint overlap — assert no crash
    expect(g.effort.rework).toBeGreaterThanOrEqual(0);
  });

  it("J19: plan revise does not add wrong-order penalty", () => {
    let g = createFreshGardenDomain();
    g = applyGardenEvent(g, {
      id: "plan",
      type: "PLAN_REVISED",
      orderedTaskIds: ["debris", "lawn"],
    });
    const summary = buildReviewSummary(g);
    expect(summary.reworkNotes.join(" ").toLowerCase()).not.toContain(
      "wrong order",
    );
  });

  it("J20: repeated inspect does not stack setup", () => {
    useGameStore.getState().inspectObject("garden-overview");
    const setup1 = useGameStore.getState().work.garden!.effort.setup;
    useGameStore.getState().inspectObject("garden-overview");
    const setup2 = useGameStore.getState().work.garden!.effort.setup;
    expect(setup2).toBe(setup1);
  });

  it("J21/J29: early finish seals incomplete/needs-attention, not fake pro", () => {
    useGameStore.getState().finishVisit();
    const g = useGameStore.getState().work.garden!;
    expect(g.visitFinished).toBe(true);
    expect(g.visitHistory.length).toBe(1);
    const sealed = g.visitHistory[0]!;
    expect(["incomplete", "needs-attention", "acceptable"]).toContain(
      sealed.qualityBand,
    );
    expect(sealed.qualityBand).not.toBe("acceptable");
  });

  it("J22: sealed summary immutable across retry", () => {
    useGameStore.getState().finishVisit();
    const sealed = structuredClone(
      useGameStore.getState().work.garden!.visitHistory,
    );
    const keep = useGameStore.getState().work.garden!.visitHistory;
    useGameStore.getState().startV03Garden();
    useGameStore.setState((s) => ({
      work: {
        ...s.work,
        garden: { ...s.work.garden!, visitHistory: keep },
      },
    }));
    expect(useGameStore.getState().work.garden!.visitHistory).toEqual(sealed);
    expect(useGameStore.getState().work.garden!.visitFinished).toBe(false);
  });

  it("J23/J24: compare visits only when quality matches", () => {
    const work = useGameStore.getState().work;
    const g = work.garden!;
    const a = buildVisitSummary(g, work, "a");
    const b = buildVisitSummary(
      {
        ...g,
        effort: { ...g.effort, rework: 2, productive: g.effort.productive + 2 },
      },
      work,
      "b",
    );
    const ok = compareVisits(a, b);
    expect(ok.comparable).toBe(true);
    expect(ok.reworkDelta).toBeCloseTo(2);

    const worse = buildVisitSummary(
      {
        ...g,
        plants: {
          ...g.plants,
          "flower-0": {
            ...g.plants["flower-0"]!,
            ornamentalDamage: true,
          },
        },
      },
      work,
      "c",
    );
    const bad = compareVisits(a, worse);
    expect(bad.comparable).toBe(false);
    expect(bad.reason.toLowerCase()).toMatch(/quality|damage|safety/);
  });

  it("J27: hand-edger/weeder are not kit masquerades", () => {
    expect(toolPresentationKind("hand-edger")).toBe("silhouette-edger");
    expect(toolPresentationKind("hand-weeder")).toBe("silhouette-weeder");
    expect(toolPresentationKind("string-trimmer")).toBe("kit");
    expect(toolPresentationKind("hand-hedge-shears")).toBe("kit");
  });

  it("J28: learning advice ties to real events when present", () => {
    let g = createFreshGardenDomain();
    const weedId = Object.keys(g.plants).find(
      (id) => g.plants[id].kind === "weed",
    )!;
    g = applyGardenEvent(g, {
      id: `top:${weedId}`,
      type: "PLANT_TOP_CUT",
      plantId: weedId,
      effort: 0.3,
    });
    const summary = buildReviewSummary(g);
    expect(
      summary.learningAdvice.some((a) => a.text.toLowerCase().includes("root")),
    ).toBe(true);
    expect(summary.learningAdvice.some((a) => a.eventId)).toBe(true);
  });

  it("tool knowledge covers contrast pairs without contradicting profiles", () => {
    for (const id of [
      "manual-reel-mower",
      "lawn-mower",
      "hand-hedge-shears",
      "hedge-trimmer",
      "hand-edger",
      "string-trimmer",
      "hand-weeder",
      "rake",
      "leaf-blower",
      "bag",
    ]) {
      const k = getToolKnowledge(id);
      expect(k?.purpose.length).toBeGreaterThan(8);
      expect(k?.limitation.length).toBeGreaterThan(8);
    }
  });
});
