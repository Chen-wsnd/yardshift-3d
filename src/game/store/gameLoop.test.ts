/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "./gameStore";

describe("game loop store actions", () => {
  beforeEach(() => {
    useGameStore.getState().resetDemo();
    localStorage.clear();
  });

  it("completes Job 1, claims once, unlocks Job 2, and rejects double claim", () => {
    expect(useGameStore.getState().acceptJob("job-overgrown-lawn")).toBe(true);

    const objectives = useGameStore
      .getState()
      .yard.objects.filter((o) => o.isObjective);
    expect(objectives.length).toBe(8);

    for (const obj of objectives) {
      useGameStore.getState().selectTool(obj.recommendedToolId ?? "rake");
      // Pick a compatible owned/loaned tool if recommended missing from owned
      const avail = useGameStore
        .getState()
        .getToolAvailability(
          useGameStore.getState().progress.selectedToolId ?? "rake",
        );
      if (avail === "locked") {
        useGameStore.getState().selectTool("rake");
      }
      // Use known compatible tools per target
      const toolByKind: Record<string, string> = {
        long_lawn: "lawn-mower",
        lawn_edge: "lawn-edger",
        tall_edge_grass: "string-trimmer",
        weeds: "string-trimmer",
        leaves: "rake",
      };
      useGameStore.getState().selectTool(toolByKind[obj.targetKind] ?? "rake");
      const result = useGameStore.getState().interactWithObject(obj.id);
      expect(result.success).toBe(true);
    }

    const progress = useGameStore.getState().getActiveJobProgress();
    expect(progress?.complete).toBe(true);

    expect(useGameStore.getState().claimReward("job-overgrown-lawn")).toBe(true);
    expect(useGameStore.getState().player.balance).toBe(40 + 500);
    expect(
      useGameStore.getState().claimReward("job-overgrown-lawn"),
    ).toBe(false);

    const job2 = useGameStore
      .getState()
      .jobs.find((j) => j.id === "job-backyard-restoration");
    expect(job2?.status).toBe("available");
  });

  it("rejects insufficient purchase and duplicate buy; reset restores starters", () => {
    expect(useGameStore.getState().purchaseTool("chainsaw").ok).toBe(false);

    useGameStore.setState({
      player: {
        ...useGameStore.getState().player,
        balance: 200,
      },
    });
    expect(useGameStore.getState().purchaseTool("leaf-blower").ok).toBe(true);
    expect(useGameStore.getState().purchaseTool("leaf-blower").ok).toBe(false);

    useGameStore.getState().resetDemo();
    expect(useGameStore.getState().player.balance).toBe(40);
    expect(useGameStore.getState().player.ownedToolIds).not.toContain(
      "leaf-blower",
    );
    expect(
      useGameStore.getState().jobs.find((j) => j.id === "job-backyard-restoration")
        ?.status,
    ).toBe("locked");
  });

  it("grants Job 2 loaners so essential tools are usable without purchase", () => {
    useGameStore.getState().acceptJob("job-overgrown-lawn");
    const objs = useGameStore.getState().yard.objects.filter((o) => o.isObjective);
    for (const obj of objs) {
      const toolByKind: Record<string, string> = {
        long_lawn: "lawn-mower",
        lawn_edge: "lawn-edger",
        tall_edge_grass: "string-trimmer",
        weeds: "string-trimmer",
        leaves: "rake",
      };
      useGameStore.getState().selectTool(toolByKind[obj.targetKind]);
      useGameStore.getState().interactWithObject(obj.id);
    }
    useGameStore.getState().claimReward("job-overgrown-lawn");

    expect(useGameStore.getState().acceptJob("job-backyard-restoration")).toBe(
      true,
    );
    const loaned = useGameStore.getState().progress.loanedToolIds;
    expect(loaned.length).toBeGreaterThan(0);
    expect(
      useGameStore.getState().getToolAvailability("chainsaw"),
    ).toBe("loaned");

    useGameStore.getState().selectTool("chainsaw");
    const branch = useGameStore
      .getState()
      .yard.objects.find((o) => o.targetKind === "fallen_branch");
    expect(branch).toBeDefined();
    expect(
      useGameStore.getState().interactWithObject(branch!.id).success,
    ).toBe(true);
  });
});
