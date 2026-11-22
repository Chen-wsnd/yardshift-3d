import { describe, expect, it } from "vitest";
import { SAMPLE_JOBS } from "@/data/sampleJobs";
import { SAMPLE_PLAYER } from "@/data/samplePlayer";
import { SAMPLE_TOOLS } from "@/data/sampleTools";
import {
  calculateJobPayout,
  canAcceptJob,
  getAcceptJobBlockReason,
} from "./jobRules";
import type { Player } from "@/game/types";

describe("canAcceptJob", () => {
  it("allows accepting an available job when required tools are owned", () => {
    const job = SAMPLE_JOBS[0];
    expect(job).toBeDefined();
    expect(canAcceptJob(SAMPLE_PLAYER, job)).toBe(true);
    expect(getAcceptJobBlockReason(SAMPLE_PLAYER, job)).toBeNull();
  });

  it("blocks acceptance when a required tool is missing", () => {
    const job = SAMPLE_JOBS[0];
    const playerWithoutTools: Player = {
      ...SAMPLE_PLAYER,
      ownedToolIds: [],
    };

    expect(canAcceptJob(playerWithoutTools, job)).toBe(false);
    expect(getAcceptJobBlockReason(playerWithoutTools, job)).toMatch(
      /Missing required tools/,
    );
  });

  it("blocks acceptance when job is already accepted", () => {
    const job = { ...SAMPLE_JOBS[0], status: "accepted" as const };
    expect(canAcceptJob(SAMPLE_PLAYER, job)).toBe(false);
  });
});

describe("calculateJobPayout", () => {
  it("returns the job reward amount", () => {
    expect(calculateJobPayout(SAMPLE_JOBS[0])).toBe(
      SAMPLE_JOBS[0].reward.amount,
    );
  });
});

describe("sample data invariants", () => {
  it("keeps default-owned tools consistent with the sample player", () => {
    const defaultOwned = SAMPLE_TOOLS.filter((t) => t.ownedByDefault).map(
      (t) => t.id,
    );
    expect(SAMPLE_PLAYER.ownedToolIds).toEqual(defaultOwned);
  });

  it("ensures the sample job references known tools and yard", () => {
    const job = SAMPLE_JOBS[0];
    const toolIds = new Set(SAMPLE_TOOLS.map((t) => t.id));

    expect(job.yardId).toBe("yard-maple-lane");
    for (const toolId of job.requiredToolIds) {
      expect(toolIds.has(toolId)).toBe(true);
    }
  });
});
