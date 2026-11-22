/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "./gameStore";

describe("lifecycle interaction costs (S3)", () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().startV03Garden();
  });

  it("selectTool does not tax setup effort", () => {
    const before = useGameStore.getState().work.garden!.effort;
    useGameStore.getState().selectTool("hand-weeder");
    useGameStore.getState().selectTool("rake");
    useGameStore.getState().selectTool("lawn-mower");
    const after = useGameStore.getState().work.garden!.effort;
    expect(after.setup).toBe(before.setup);
  });

  it("repeat topCut after stump is zero-cost", () => {
    const g = () => useGameStore.getState();
    g().selectTool("string-trimmer");
    const weed = Object.values(g().work.garden!.plants).find(
      (p) => p.kind === "weed",
    )!;
    g().topCutWeed(weed.id);
    const mid = g().work.tools["string-trimmer"]!;
    const midCond = mid.condition;
    const midRes = mid.resource;
    const midEffort = g().work.garden!.effort.productive;
    g().topCutWeed(weed.id);
    const after = g().work.tools["string-trimmer"]!;
    expect(after.condition).toBe(midCond);
    expect(after.resource).toBe(midRes);
    expect(g().work.garden!.effort.productive).toBe(midEffort);
    expect(g().work.lastEvents[0]?.id).toBe("top-already");
  });

  it("blow miss does not drain battery", () => {
    const g = () => useGameStore.getState();
    g().selectTool("leaf-blower");
    const before = g().work.tools["leaf-blower"]!;
    g().blowDebris(20, 20, 1, 0);
    const after = g().work.tools["leaf-blower"]!;
    expect(after.resource).toBe(before.resource);
    expect(after.condition).toBe(before.condition);
    expect(g().work.lastEvents[0]?.id).toBe("blow-miss");
  });

  it("rake that moves debris applies manual wear", () => {
    const g = () => useGameStore.getState();
    g().selectTool("rake");
    const leaf = Object.values(g().work.garden!.debris).find(
      (d) => d.state === "scattered",
    )!;
    const before = g().work.tools.rake!.condition;
    g().rakeDebris(leaf.x, leaf.z, 0.5, 0);
    expect(g().work.tools.rake!.condition).toBeLessThan(before);
  });

  it("hazard inspect then stone clear; hardwood refuses hand clear", () => {
    const g = () => useGameStore.getState();
    g().selectTool(null);
    g().inspectObject("lawn-stone-1");
    expect(g().work.garden!.inspection["lawn-stone-1"]?.observed).toBe(true);
    const stoneCond = Object.values(g().work.tools).map((t) => t.condition);
    g().removeHazard("lawn-stone-1");
    expect(g().work.garden!.hazards["lawn-stone-1"].cleared).toBe(true);
    expect(Object.values(g().work.tools).map((t) => t.condition)).toEqual(
      stoneCond,
    );

    g().inspectObject("hedge-hardwood-1");
    g().removeHazard("hedge-hardwood-1");
    expect(g().work.garden!.hazards["hedge-hardwood-1"].cleared).toBe(false);
    expect(g().work.lastEvents[0]?.id).toBe("hazard-hardwood");
  });

  it("fresh yard defaults to Hands (null tool)", () => {
    expect(useGameStore.getState().work.selectedToolId).toBeNull();
  });
});
