/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "./gameStore";

describe("v0.2 store orchestration", () => {
  beforeEach(() => {
    useGameStore.getState().startV02Demo();
    localStorage.clear();
  });

  it("accepts job 1, rents once, refuses double rent charge", () => {
    const g = () => useGameStore.getState();
    expect(g().acceptJob("job-overgrown-lawn")).toBe(true);
    const bal = g().work.balance;
    // string-trimmer rental 35 fits starting 40 credits
    expect(g().rentTool("string-trimmer").ok).toBe(true);
    expect(g().work.balance).toBe(bal - 35);
    expect(g().rentTool("string-trimmer").ok).toBe(true);
    expect(g().work.balance).toBe(bal - 35);
  });

  it("blocks job 2 until job 1 claimed", () => {
    const g = () => useGameStore.getState();
    expect(g().isJobUnlocked("job-backyard-restoration")).toBe(false);
    expect(g().acceptJob("job-backyard-restoration")).toBe(false);
  });

  it("settles payout once via finishJob", () => {
    const g = () => useGameStore.getState();
    expect(g().acceptJob("job-overgrown-lawn")).toBe(true);
    const job = g().work.jobs["job-overgrown-lawn"];
    const zones = job.zones.map((z) => ({
      ...z,
      cells: z.cells.map((c) =>
        c.isPile
          ? { ...c, collected: true, result: "bagged" as const }
          : {
              ...c,
              remainingWork: 0,
              result: "finished" as const,
              collected: true,
            },
      ),
    }));
    useGameStore.setState({
      work: {
        ...g().work,
        activeJobId: "job-overgrown-lawn",
        jobs: {
          ...g().work.jobs,
          "job-overgrown-lawn": { ...job, zones },
        },
      },
    });
    const bal = g().work.balance;
    const result = g().finishJob(false);
    expect(result.ok).toBe(true);
    expect(g().work.jobs["job-overgrown-lawn"].claimed).toBe(true);
    expect(g().work.balance).toBeGreaterThan(bal);
    expect(g().finishJob(false).ok).toBe(false);
  });
});
