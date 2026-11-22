import { beforeEach, describe, expect, it } from "vitest";
import { LAWN_ZONE_ID } from "@/data/lawnGrid";
import { V03_GARDEN_JOB_ID } from "@/game/work/gardenFixtures";
import { useGameStore } from "@/game/store/gameStore";
import { buildReviewSummary } from "./reviewSelectors";

describe("independent edge domain (T16–T17)", () => {
  beforeEach(() => {
    useGameStore.getState().startV03Garden();
  });

  it("T17: edge work does not raise lawn completion", () => {
    const beforeLawn = useGameStore
      .getState()
      .work.jobs[V03_GARDEN_JOB_ID].zones.find((z) => z.id === LAWN_ZONE_ID)!
      .cells.filter((c) => c.remainingWork < 100).length;

    useGameStore.getState().selectTool("hand-edger");
    const samples = Array.from({ length: 8 }, (_, i) => ({
      x: -3 + i * 0.5,
      z: -3.55,
    }));
    useGameStore.getState().applyEdgeWork(-1, -3.55, samples);

    const afterLawn = useGameStore
      .getState()
      .work.jobs[V03_GARDEN_JOB_ID].zones.find((z) => z.id === LAWN_ZONE_ID)!
      .cells.filter((c) => c.remainingWork < 100).length;
    expect(afterLawn).toBe(beforeLawn);

    const segs = Object.values(
      useGameStore.getState().work.garden!.edgeSegments,
    );
    expect(segs.some((s) => s.remaining < 100 || s.finished)).toBe(true);
  });

  it("T16: review shows unfinished edge even if lawn untouched note exists", () => {
    useGameStore.getState().selectTool("hand-edger");
    // Leave edge unfinished
    const summary = buildReviewSummary(
      useGameStore.getState().work.garden!,
      useGameStore.getState().work,
    );
    expect(summary.edgeFinishedPct).toBeLessThan(100);
    expect(summary.lawnFinishedPct).toBeLessThan(70);
    expect(summary.canFinishWell).toBe(false);
  });
});
