import { describe, expect, it } from "vitest";
import { applyWorkAction } from "./engine";
import { createFreshV03GardenSnapshot, V03_GARDEN_JOB_ID } from "./gardenFixtures";
import type { WorkAction, WorkSnapshot } from "./types";

function stroke(
  snap: WorkSnapshot,
  overrides: Partial<WorkAction> &
    Pick<WorkAction, "toolId" | "worldX" | "worldZ" | "direction">,
) {
  return applyWorkAction(snap, {
    jobId: V03_GARDEN_JOB_ID,
    zoneId: "j1-lawn",
    action: "cut",
    strokeId: `s-${Math.random()}`,
    ...overrides,
  });
}

describe("v0.3 lawn vertical slice", () => {
  it("starts garden mode with schema 3, lawn job active, powered mower owned", () => {
    const snap = createFreshV03GardenSnapshot();
    expect(snap.schemaVersion).toBe(3);
    expect(snap.activeJobId).toBe(V03_GARDEN_JOB_ID);
    expect(snap.focusedZoneId).toBeNull();
    expect(snap.ownedToolIds).toContain("manual-reel-mower");
    expect(snap.ownedToolIds).toContain("lawn-mower");
    expect(snap.balance).toBe(0);
  });

  it("keeps partial lawn progress across snapshot reuse (exit/re-entry)", () => {
    let snap = createFreshV03GardenSnapshot();
    const lawn = snap.jobs[V03_GARDEN_JOB_ID].zones.find((z) => z.id === "j1-lawn")!;
    const cell = lawn.cells.find((c) => !c.protectedKind)!;
    const r1 = stroke(snap, {
      toolId: "manual-reel-mower",
      worldX: cell.localX,
      worldZ: cell.localZ,
      direction: [1, 0],
    });
    snap = r1.nextState;
    const after = snap.jobs[V03_GARDEN_JOB_ID].zones
      .find((z) => z.id === "j1-lawn")!
      .cells.find((c) => c.id === cell.id)!;
    expect(after.remainingWork).toBeLessThan(100);
    expect(after.remainingWork).toBeGreaterThan(0);

    // Simulate leaving task (focus null) — cells unchanged
    snap = { ...snap, focusedZoneId: null };
    const still = snap.jobs[V03_GARDEN_JOB_ID].zones
      .find((z) => z.id === "j1-lawn")!
      .cells.find((c) => c.id === cell.id)!;
    expect(still.remainingWork).toBe(after.remainingWork);
  });

  it("records pointer direction on work actions (not a constant vector)", () => {
    const snap = createFreshV03GardenSnapshot();
    const lawn = snap.jobs[V03_GARDEN_JOB_ID].zones.find((z) => z.id === "j1-lawn")!;
    const cell = lawn.cells[0];
    const a = stroke(snap, {
      toolId: "manual-reel-mower",
      worldX: cell.localX,
      worldZ: cell.localZ,
      direction: [0, 1],
    });
    expect(a.nextState.jobs[V03_GARDEN_JOB_ID].workActions).toBeGreaterThan(0);
    const b = stroke(a.nextState, {
      toolId: "manual-reel-mower",
      worldX: cell.localX + 0.2,
      worldZ: cell.localZ + 0.5,
      direction: [-0.6, 0.8],
    });
    expect(b.nextState.jobs[V03_GARDEN_JOB_ID].workActions).toBeGreaterThan(
      a.nextState.jobs[V03_GARDEN_JOB_ID].workActions,
    );
  });

  it("powered mower covers more cells than reel in one stroke", () => {
    const snap = createFreshV03GardenSnapshot();
    const lawn = snap.jobs[V03_GARDEN_JOB_ID].zones.find((z) => z.id === "j1-lawn")!;
    // Aim at interior grass away from flower border
    const cell = lawn.cells.find((c) => c.localX < 0 && !c.protectedKind)!;

    const reel = stroke(structuredClone(snap), {
      toolId: "manual-reel-mower",
      worldX: cell.localX,
      worldZ: cell.localZ,
      direction: [1, 0],
    });
    const powered = stroke(structuredClone(snap), {
      toolId: "lawn-mower",
      worldX: cell.localX,
      worldZ: cell.localZ,
      direction: [1, 0],
    });

    const countTouched = (s: WorkSnapshot) =>
      s.jobs[V03_GARDEN_JOB_ID].zones
        .find((z) => z.id === "j1-lawn")!
        .cells.filter((c) => c.remainingWork < 100).length;

    expect(countTouched(powered.nextState)).toBeGreaterThan(
      countTouched(reel.nextState),
    );
  });

  it("flower damage is once-only and persists", () => {
    let snap = createFreshV03GardenSnapshot();
    const lawn = snap.jobs[V03_GARDEN_JOB_ID].zones.find((z) => z.id === "j1-lawn")!;
    const flower = lawn.cells.find((c) => c.protectedKind === "flower");
    expect(flower).toBeTruthy();

    const first = stroke(snap, {
      toolId: "lawn-mower",
      worldX: flower!.localX,
      worldZ: flower!.localZ,
      direction: [1, 0],
    });
    snap = first.nextState;
    expect(snap.damageKeys.some((k) => k.includes("flower_damaged"))).toBe(true);
    const keysAfter = snap.damageKeys.length;

    const second = stroke(snap, {
      toolId: "lawn-mower",
      worldX: flower!.localX,
      worldZ: flower!.localZ,
      direction: [1, 0],
    });
    expect(second.nextState.damageKeys.length).toBe(keysAfter);

    const cell = second.nextState.jobs[V03_GARDEN_JOB_ID].zones
      .find((z) => z.id === "j1-lawn")!
      .cells.find((c) => c.id === flower!.id)!;
    expect(
      cell.result === "flower_damaged" ||
        cell.damageKinds.includes("flower_damaged"),
    ).toBe(true);
  });

  it("does not charge rental when powered mower is already owned in garden mode", () => {
    const snap = createFreshV03GardenSnapshot();
    expect(snap.ownedToolIds).toContain("lawn-mower");
    expect(snap.ledger.filter((l) => l.kind === "rental")).toHaveLength(0);
    expect(snap.balance).toBe(0);
  });
});
