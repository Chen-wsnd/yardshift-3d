import { describe, expect, it } from "vitest";
import { LAWN_ZONE_ID } from "@/data/lawnGrid";
import { applyWorkAction } from "./engine";
import { createFreshV03GardenSnapshot, V03_GARDEN_JOB_ID } from "./gardenFixtures";
import { interpolateSamples } from "./lawnSweep";
import type { WorkAction, WorkSnapshot } from "./types";

function sweep(
  snap: WorkSnapshot,
  overrides: Partial<WorkAction> &
    Pick<WorkAction, "toolId" | "worldX" | "worldZ">,
) {
  const samples =
    overrides.sweepSamples ??
    interpolateSamples(
      { x: overrides.worldX - 0.4, z: overrides.worldZ },
      { x: overrides.worldX + 0.4, z: overrides.worldZ },
      0.5,
    );
  return applyWorkAction(snap, {
    jobId: V03_GARDEN_JOB_ID,
    zoneId: LAWN_ZONE_ID,
    action: "cut",
    strokeId: `s-${Math.random()}`,
    direction: [1, 0],
    forwardMotion: true,
    ...overrides,
    sweepSamples: samples,
  });
}

describe("v0.3 lawn vertical slice (P0-compatible)", () => {
  it("starts garden mode with schema 3, lawn job active, powered mower owned", () => {
    const snap = createFreshV03GardenSnapshot();
    expect(snap.schemaVersion).toBe(3);
    expect(snap.activeJobId).toBe(V03_GARDEN_JOB_ID);
    expect(snap.focusedZoneId).toBeNull();
    expect(snap.ownedToolIds).toContain("manual-reel-mower");
    expect(snap.ownedToolIds).toContain("lawn-mower");
    expect(snap.balance).toBe(0);
  });

  it("keeps partial lawn progress across exit/re-entry", () => {
    let snap = createFreshV03GardenSnapshot();
    const lawn = snap.jobs[V03_GARDEN_JOB_ID].zones.find(
      (z) => z.id === LAWN_ZONE_ID,
    )!;
    const cell = lawn.cells.find((c) => !c.protectedKind)!;
    const r1 = sweep(snap, {
      toolId: "manual-reel-mower",
      worldX: cell.localX,
      worldZ: cell.localZ,
    });
    snap = r1.nextState;
    const after = snap.jobs[V03_GARDEN_JOB_ID].zones
      .find((z) => z.id === LAWN_ZONE_ID)!
      .cells.find((c) => c.id === cell.id)!;
    expect(after.remainingWork).toBeLessThan(100);
    snap = { ...snap, focusedZoneId: null };
    const still = snap.jobs[V03_GARDEN_JOB_ID].zones
      .find((z) => z.id === LAWN_ZONE_ID)!
      .cells.find((c) => c.id === cell.id)!;
    expect(still.remainingWork).toBe(after.remainingWork);
  });

  it("does not charge rental when powered mower is already owned", () => {
    const snap = createFreshV03GardenSnapshot();
    expect(snap.ownedToolIds).toContain("lawn-mower");
    expect(snap.ledger.filter((l) => l.kind === "rental")).toHaveLength(0);
  });
});
