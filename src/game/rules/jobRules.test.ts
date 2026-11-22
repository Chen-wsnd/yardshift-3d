import { describe, expect, it } from "vitest";
import { JOBS } from "@/data/jobs";
import {
  LAYOUT_OVERGROWN_LAWN,
  cloneLayoutObjects,
} from "@/data/layouts";
import { INITIAL_PLAYER } from "@/data/player";
import { STARTER_TOOL_IDS } from "@/data/tools";
import {
  calculateJobPayout,
  canAcceptJob,
  countScoreableObjectives,
  getAcceptJobBlockReason,
  getJobProgress,
  isJobUnlocked,
} from "./jobRules";
import type { YardObject } from "@/game/types";

const job1 = JOBS[0];
const job2 = JOBS[1];

describe("job unlock and accept", () => {
  it("allows Job 1 when available", () => {
    expect(canAcceptJob(INITIAL_PLAYER, job1, [])).toBe(true);
    expect(getAcceptJobBlockReason(INITIAL_PLAYER, job1, [])).toBeNull();
  });

  it("locks Job 2 before Job 1 reward claim", () => {
    expect(isJobUnlocked(job2, [])).toBe(false);
    expect(canAcceptJob(INITIAL_PLAYER, { ...job2, status: "available" }, [])).toBe(
      false,
    );
  });

  it("unlocks Job 2 after Job 1 claim", () => {
    expect(isJobUnlocked(job2, ["job-overgrown-lawn"])).toBe(true);
    expect(
      canAcceptJob(
        INITIAL_PLAYER,
        { ...job2, status: "available" },
        ["job-overgrown-lawn"],
      ),
    ).toBe(true);
  });
});

describe("job progress", () => {
  it("ignores decorative objects in scoreable count", () => {
    const objects = cloneLayoutObjects(LAYOUT_OVERGROWN_LAWN);
    const scoreable = countScoreableObjectives(objects);
    const decorative = objects.filter((o) => !o.isObjective).length;
    expect(decorative).toBeGreaterThan(0);
    expect(scoreable).toBe(job1.objectiveIds.length);
    expect(scoreable).toBe(8);
  });

  it("is incomplete while any required target remains", () => {
    const objects = cloneLayoutObjects(LAYOUT_OVERGROWN_LAWN);
    const progress = getJobProgress(job1.id, objects, job1.objectiveIds);
    expect(progress.complete).toBe(false);
    expect(progress.cleanedCount).toBe(0);
  });

  it("completes when all objectives cleaned; double-clean does not inflate count", () => {
    const objects = cloneLayoutObjects(LAYOUT_OVERGROWN_LAWN).map((o) =>
      o.isObjective
        ? { ...o, cleaned: true, interactionState: "cleaned" as const }
        : o,
    );
    const progress = getJobProgress(job1.id, objects, job1.objectiveIds);
    expect(progress.complete).toBe(true);
    expect(progress.cleanedCount).toBe(8);

    // Cleaning again in-place still counts once
    const again = objects.map((o) =>
      o.isObjective ? { ...o, cleaned: true } : o,
    );
    expect(getJobProgress(job1.id, again, job1.objectiveIds).cleanedCount).toBe(
      8,
    );
  });

  it("returns payout amount", () => {
    expect(calculateJobPayout(job1)).toBe(500);
    expect(calculateJobPayout(job2)).toBe(350);
  });
});

describe("sample data invariants", () => {
  it("keeps starter tools on the initial player", () => {
    expect(INITIAL_PLAYER.ownedToolIds).toEqual(STARTER_TOOL_IDS);
  });

  it("Job layouts only score isObjective targets", () => {
    const objs: YardObject[] = cloneLayoutObjects(LAYOUT_OVERGROWN_LAWN);
    for (const id of job1.objectiveIds) {
      const found = objs.find((o) => o.id === id);
      expect(found?.isObjective).toBe(true);
      expect(found?.targetKind).not.toBe("decorative");
    }
  });
});
