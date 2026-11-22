/**
 * Closure P0/P1 regressions — hazard entry, canvas-stable focus, migrate weeds,
 * qualityBand compare, advice event integrity, sealed writes, source registry.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { createFreshGardenDomain } from "@/game/garden/fixtures";
import { migrateGardenDomain } from "@/game/garden/migrateGarden";
import { applyGardenEvent, gatherNearbyDebris } from "@/game/garden/reducer";
import { countPotentialRedirty } from "@/game/garden/spatialRework";
import { useGameStore } from "@/game/store/gameStore";
import { buildLearningAdvice } from "./learningAdvice";
import { getToolKnowledge } from "./toolKnowledge";
import {
  buildVisitSummary,
  comparableCoverage,
  compareVisits,
  type VisitSummary,
} from "./visitSummary";

describe("V06 closure P0/P1", () => {
  beforeEach(() => {
    useGameStore.getState().startV03Garden();
  });

  it("P0-01: hazard task with null tool enters activeTaskId", () => {
    const g = useGameStore.getState().work.garden!;
    expect(
      Object.values(g.hazards).some((h) => !h.cleared),
    ).toBe(true);
    // Simulate WorkConfirm hands-only → Shell sets task without selectTool
    useGameStore.getState().setActiveGardenTask("hazard");
    expect(useGameStore.getState().work.garden!.activeTaskId).toBe("hazard");
    const hid = Object.keys(useGameStore.getState().work.garden!.hazards)[0]!;
    useGameStore.getState().inspectObject(hid);
    useGameStore.getState().removeHazard(hid);
    expect(useGameStore.getState().work.garden!.hazards[hid]!.cleared).toBe(
      true,
    );
  });

  it("P0-02: setFocusPoint does not clear hedge cut progress", () => {
    useGameStore.getState().selectTool("hand-hedge-shears");
    const id = Object.keys(
      useGameStore.getState().work.garden!.hedgeClusters,
    )[0]!;
    useGameStore.getState().cutHedgeCluster(id, "hand-hedge-shears");
    expect(useGameStore.getState().work.garden!.hedgeClusters[id]!.cut).toBe(
      true,
    );
    useGameStore.getState().setFocusPoint({ x: 6.4, z: 1 });
    useGameStore.getState().setFocusPoint({ x: 6.5, z: 1.2 });
    expect(useGameStore.getState().work.garden!.hedgeClusters[id]!.cut).toBe(
      true,
    );
  });

  it("P1-01: distant legacy weeds relocate into operable bed; progress kept", () => {
    const raw = createFreshGardenDomain();
    const distant = {
      ...raw,
      schemaVersion: 2 as const,
      plants: {
        "weed-111": {
          id: "weed-111",
          kind: "weed" as const,
          x: 3.0,
          z: 0.9,
          topCut: false,
          rootRemoved: false,
          ornamentalDamage: false,
          countsTowardCompletion: true,
        },
        "weed-112": {
          id: "weed-112",
          kind: "weed" as const,
          x: -0.5,
          z: 4.9,
          topCut: true,
          rootRemoved: true,
          ornamentalDamage: false,
          countsTowardCompletion: true,
        },
        "flower-0": {
          id: "flower-0",
          kind: "flower" as const,
          x: -6.1,
          z: 1.5,
          topCut: false,
          rootRemoved: false,
          ornamentalDamage: true,
          countsTowardCompletion: false,
        },
      },
    };
    const m1 = migrateGardenDomain(raw);
    const m = migrateGardenDomain(distant as typeof raw);
    expect(m.plants["weed-111"]!.x).toBeLessThan(-5.4);
    expect(m.plants["weed-111"]!.z).toBeGreaterThan(1.2);
    // Already pulled: still relocated if distant id, but progress preserved
    expect(m.plants["weed-112"]!.rootRemoved).toBe(true);
    expect(m.plants["weed-112"]!.topCut).toBe(true);
    expect(m.plants["flower-0"]!.ornamentalDamage).toBe(true);
    const m2 = migrateGardenDomain(m);
    expect(m2.plants["weed-111"]!.x).toBe(m.plants["weed-111"]!.x);
    expect(m2.plants["weed-111"]!.z).toBe(m.plants["weed-111"]!.z);
    void m1;
  });

  it("P1-02: sealed blocks inspect / plan / tool work; camera focus OK", () => {
    useGameStore.getState().finishVisit();
    expect(useGameStore.getState().work.garden!.visitFinished).toBe(true);
    const eventsBefore =
      useGameStore.getState().work.garden!.events.length;
    useGameStore.getState().inspectObject("garden-overview");
    useGameStore.getState().revisePlan(["lawn", "hedge"]);
    useGameStore.getState().selectTool("rake");
    // GATE-G: activeTaskId is camera guide — allowed when sealed
    useGameStore.getState().setActiveGardenTask("hedge");
    expect(useGameStore.getState().work.garden!.activeTaskId).toBe("hedge");
    expect(useGameStore.getState().work.garden!.events.length).toBe(
      eventsBefore,
    );
    expect(useGameStore.getState().work.selectedToolId).not.toBe("rake");
  });

  it("P1-03: re-cut same cluster without intentional overcut does not drain", () => {
    useGameStore.getState().selectTool("hedge-trimmer");
    const id = Object.keys(
      useGameStore.getState().work.garden!.hedgeClusters,
    )[0]!;
    const before =
      useGameStore.getState().work.tools["hedge-trimmer"]!.resource;
    useGameStore.getState().cutHedgeCluster(id, "hedge-trimmer", false);
    const mid = useGameStore.getState().work.tools["hedge-trimmer"]!.resource;
    expect(mid).toBeLessThan(before);
    useGameStore.getState().cutHedgeCluster(id, "hedge-trimmer", false);
    expect(useGameStore.getState().work.tools["hedge-trimmer"]!.resource).toBe(
      mid,
    );
    // Intentional overcut does consume once
    useGameStore.getState().cutHedgeCluster(id, "hedge-trimmer", true);
    expect(
      useGameStore.getState().work.garden!.hedgeClusters[id]!.overcut,
    ).toBe(true);
    expect(
      useGameStore.getState().work.tools["hedge-trimmer"]!.resource,
    ).toBeLessThan(mid);
  });

  it("P1-04: qualityBand mismatch → not comparable; TOOL_SELECTED not usedTools", () => {
    const base = buildVisitSummary(
      useGameStore.getState().work.garden!,
      useGameStore.getState().work,
      "a",
    );
    const incomplete: VisitSummary = {
      ...base,
      qualityBand: "incomplete",
      final: { ...base.final, lawnPct: 69 },
    };
    const acceptable: VisitSummary = {
      ...base,
      qualityBand: "acceptable",
      final: { ...base.final, lawnPct: 72 },
    };
    expect(comparableCoverage(incomplete, acceptable)).toBe(false);
    expect(compareVisits(incomplete, acceptable).comparable).toBe(false);

    useGameStore.getState().selectTool("rake");
    useGameStore.getState().selectTool("bag");
    const summary = buildVisitSummary(
      useGameStore.getState().work.garden!,
      useGameStore.getState().work,
      "sel",
    );
    expect(summary.toolsUsed).not.toContain("rake");
    expect(summary.toolsUsed).not.toContain("bag");
  });

  it("P1-05: redirty advice uses real spawn ids; hazard has no fake eventId", () => {
    let g = createFreshGardenDomain();
    const clusterId = Object.keys(g.hedgeClusters)[0]!;
    const c = g.hedgeClusters[clusterId]!;
    // Place a leaf under the cluster, clean it, then cut so clippings redirt
    const leafId = "leaf-east-0";
    if (g.debris[leafId]) {
      g = {
        ...g,
        debris: {
          ...g.debris,
          [leafId]: {
            ...g.debris[leafId]!,
            x: c.x,
            z: c.z + 0.35,
            state: "scattered",
          },
        },
      };
    }
    g = gatherNearbyDebris(g, c.x, c.z + 0.35, 1.5, "east-pre");
    g = applyGardenEvent(g, {
      id: `hedge-cut:${clusterId}:hand-hedge-shears`,
      type: "HEDGE_CLUSTER_CUT",
      clusterId,
      effort: 0.5,
      worldFootprint: { x: c.x, z: c.z, radius: 1 },
    });
    const redirt = countPotentialRedirty(g);
    expect(redirt.spawnEventIds.length).toBeGreaterThan(0);
    const advice = buildLearningAdvice(g, {
      weedsWithRoots: 1,
      lawnFinishedPct: 80,
      edgeFinishedPct: 10,
      unresolvedHazards: 1,
    });
    const hazardTip = advice.find((a) => a.areaId === "hazard");
    expect(hazardTip?.sourceType).toBe("current-state");
    expect(hazardTip?.eventId).toBeUndefined();
    const debrisTip = advice.find((a) => a.areaId === "debris");
    if (debrisTip?.eventId) {
      expect(g.events.some((e) => e.id === debrisTip.eventId)).toBe(true);
    }
  });

  it("P1-10: every toolKnowledge sourceId is in TOOL_KNOWLEDGE_SOURCES.md", () => {
    const doc = readFileSync(
      join(process.cwd(), "docs/TOOL_KNOWLEDGE_SOURCES.md"),
      "utf8",
    );
    const ids = new Set<string>();
    for (const line of doc.split("\n")) {
      const m = line.match(/^\| ([a-z0-9-]+) \| https?:\/\//);
      if (m) ids.add(m[1]!);
    }
    const tools = [
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
    ];
    for (const id of tools) {
      const k = getToolKnowledge(id);
      for (const sid of k?.sourceIds ?? []) {
        expect(ids.has(sid), `missing registry row for ${sid}`).toBe(true);
      }
    }
  });
});
