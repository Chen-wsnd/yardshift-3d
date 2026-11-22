/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "./gameStore";

describe("v0.3 garden store", () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().startV03Garden();
  });

  it("persists under yardshift-v03 without touching yardshift-v02", () => {
    localStorage.setItem("yardshift-v02", JSON.stringify({ legacy: true }));
    useGameStore.getState().focusZone("j1-lawn");
    useGameStore.getState().selectTool("lawn-mower");
    const work = useGameStore.getState().work;
    expect(work.focusedZoneId).toBe("j1-lawn");
    expect(work.selectedToolId).toBe("lawn-mower");
    expect(work.schemaVersion).toBe(3);
    expect(localStorage.getItem("yardshift-v02")).toContain("legacy");
  });

  it("overview → focus lawn → work → return keeps cell progress", () => {
    const g = () => useGameStore.getState();
    expect(g().work.schemaVersion).toBe(3);
    g().focusZone("j1-lawn");
    g().selectTool("manual-reel-mower");
    const lawn = g().work.jobs["job-overgrown-lawn"].zones.find(
      (z) => z.id === "j1-lawn",
    )!;
    const cell = lawn.cells.find((c) => !c.protectedKind)!;
    g().performWorkAction({
      zoneId: "j1-lawn",
      toolId: "manual-reel-mower",
      action: "cut",
      worldX: cell.localX,
      worldZ: cell.localZ,
      strokeId: "t1",
      direction: [0.2, 0.9],
      forwardMotion: true,
      sweepSamples: [
        { x: cell.localX - 0.3, z: cell.localZ },
        { x: cell.localX, z: cell.localZ },
        { x: cell.localX + 0.3, z: cell.localZ },
      ],
    });
    const mid = g()
      .work.jobs["job-overgrown-lawn"].zones.find((z) => z.id === "j1-lawn")!
      .cells.find((c) => c.id === cell.id)!;
    expect(mid.remainingWork).toBeLessThan(100);
    g().focusZone(null);
    const after = g()
      .work.jobs["job-overgrown-lawn"].zones.find((z) => z.id === "j1-lawn")!
      .cells.find((c) => c.id === cell.id)!;
    expect(after.remainingWork).toBe(mid.remainingWork);
  });

  it("legacy startV02Demo still available and does not double-charge rentals", () => {
    const g = () => useGameStore.getState();
    g().startV02Demo();
    expect(g().work.schemaVersion).toBe(2);
    expect(g().acceptJob("job-overgrown-lawn")).toBe(true);
    const bal = g().work.balance;
    expect(g().rentTool("string-trimmer").ok).toBe(true);
    expect(g().work.balance).toBe(bal - 35);
    expect(g().rentTool("string-trimmer").ok).toBe(true);
    expect(g().work.balance).toBe(bal - 35);
  });
});
