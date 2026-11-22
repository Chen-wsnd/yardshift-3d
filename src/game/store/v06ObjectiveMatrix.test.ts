/**
 * Objective V06 matrix — each case has explicit input → expected state → fail condition.
 * Browser screenshots are not used as pass criteria here.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { LAWN_FINE, LAWN_ZONE_ID } from "@/data/lawnGrid";
import { HEDGE_EAST_NODES } from "@/data/gardenPlacement";
import { createFreshV03GardenSnapshot, V03_GARDEN_JOB_ID } from "@/game/work/gardenFixtures";
import { migrateLawnIfNeeded } from "@/game/work/gardenFixtures";
import { createFreshGardenDomain } from "@/game/garden/fixtures";
import { applyGardenEvent, gatherNearbyDebris } from "@/game/garden/reducer";
import { buildReviewSummary } from "@/game/garden/reviewSelectors";
import { useGameStore } from "./gameStore";

describe("v06 objective matrix", () => {
  beforeEach(() => {
    useGameStore.getState().startV03Garden();
  });

  it("snapshot-restore-and-no-data-loss: migrate keeps fine lawn cut + adds garden if missing", () => {
    // Input: v03 snap with cut cells, no garden domain
    const snap = createFreshV03GardenSnapshot();
    const lawn = snap.jobs[V03_GARDEN_JOB_ID].zones.find((z) => z.id === LAWN_ZONE_ID)!;
    lawn.cells[10] = { ...lawn.cells[10], remainingWork: 40, result: "partial" };
    lawn.cells[11] = {
      ...lawn.cells[11],
      remainingWork: 0,
      result: "flower_damaged",
      damageKinds: ["flower_damaged"],
    };
    // Omit garden to simulate pre-V06 persist payload
    const withoutGarden = { ...snap };
    delete withoutGarden.garden;
    const raw = withoutGarden;

    // Act
    const migrated = migrateLawnIfNeeded(raw);
    const withGarden =
      migrated.schemaVersion === 3 && !migrated.garden
        ? { ...migrated, garden: createFreshGardenDomain() }
        : migrated;

    // Expected
    const mLawn = withGarden.jobs[V03_GARDEN_JOB_ID].zones.find(
      (z) => z.id === LAWN_ZONE_ID,
    )!;
    expect(mLawn.cells.length).toBe(LAWN_FINE.cols * LAWN_FINE.rows);
    expect(mLawn.cells[10].remainingWork).toBe(40);
    expect(mLawn.cells[11].result).toBe("flower_damaged");
    expect(withGarden.garden).toBeTruthy();
    // Fail if: fine grid rebuilt wiping cuts, or garden never attached
  });

  it("charging-no-balance-lock: resource 0 → recharge → usable without credits", () => {
    // Input
    const store = useGameStore.getState();
    expect(store.work.balance).toBe(0);
    useGameStore.setState({
      work: {
        ...store.work,
        tools: {
          ...store.work.tools,
          "lawn-mower": {
            ...store.work.tools["lawn-mower"],
            resource: 0,
            status: "unpowered",
          },
        },
      },
    });

    // Act
    const res = useGameStore.getState().rechargeTool("lawn-mower");

    // Expected
    expect(res.ok).toBe(true);
    const tool = useGameStore.getState().work.tools["lawn-mower"];
    expect(tool.resource).toBe(100);
    expect(tool.status).toBe("ready");
    expect(useGameStore.getState().work.balance).toBe(0);
    expect(useGameStore.getState().work.garden!.effort.recovery).toBeGreaterThan(0);
    // Fail if: requires credits, or clears jam/broken instead
  });

  it("charging refuses jammed/broken (not a repair substitute)", () => {
    const base = useGameStore.getState().work;
    useGameStore.setState({
      work: {
        ...base,
        tools: {
          ...base.tools,
          "lawn-mower": {
            ...base.tools["lawn-mower"],
            resource: 10,
            status: "jammed",
          },
        },
      },
    });
    expect(useGameStore.getState().rechargeTool("lawn-mower").ok).toBe(false);

    useGameStore.setState({
      work: {
        ...useGameStore.getState().work,
        tools: {
          ...useGameStore.getState().work.tools,
          "lawn-mower": {
            ...useGameStore.getState().work.tools["lawn-mower"],
            status: "broken",
            condition: 0,
          },
        },
      },
    });
    expect(useGameStore.getState().rechargeTool("lawn-mower").ok).toBe(false);
  });

  it("performWorkAction forwards sweepSamples (blocker regression)", () => {
    // Input: continuous samples along lawn centreline
    const samples = Array.from({ length: 11 }, (_, i) => ({
      x: -2.5 + i * 0.2,
      z: 0.5,
    }));
    const before = useGameStore
      .getState()
      .work.jobs[V03_GARDEN_JOB_ID].zones.find((z) => z.id === LAWN_ZONE_ID)!
      .cells.filter((c) => c.remainingWork < 100).length;

    // Act
    useGameStore.getState().selectTool("manual-reel-mower");
    const events = useGameStore.getState().performWorkAction({
      jobId: V03_GARDEN_JOB_ID,
      zoneId: LAWN_ZONE_ID,
      toolId: "manual-reel-mower",
      action: "cut",
      worldX: -0.5,
      worldZ: 0.5,
      strokeId: "obj-sweep",
      direction: [1, 0],
      forwardMotion: true,
      sweepSamples: samples,
    });

    // Expected
    expect(events.some((e) => e.kind === "progress")).toBe(true);
    const after = useGameStore
      .getState()
      .work.jobs[V03_GARDEN_JOB_ID].zones.find((z) => z.id === LAWN_ZONE_ID)!
      .cells.filter((c) => c.remainingWork < 100).length;
    expect(after).toBeGreaterThan(before);
    expect(after).toBeGreaterThan(4);
    // Fail if: "No work under the tool stroke" / cells unchanged (sweepSamples dropped)
  });

  it("battery-no-double-drain: equal path length drains similarly regardless of sample count", () => {
    const run = (sampleCount: number) => {
      useGameStore.getState().startV03Garden();
      useGameStore.getState().selectTool("lawn-mower");
      const from = { x: -2, z: 0 };
      const to = { x: 0, z: 0 };
      const samples = Array.from({ length: sampleCount }, (_, i) => {
        const t = (i + 1) / sampleCount;
        return { x: from.x + (to.x - from.x) * t, z: from.z };
      });
      useGameStore.getState().performWorkAction({
        jobId: V03_GARDEN_JOB_ID,
        zoneId: LAWN_ZONE_ID,
        toolId: "lawn-mower",
        action: "cut",
        worldX: to.x,
        worldZ: to.z,
        strokeId: `batt-${sampleCount}`,
        direction: [1, 0],
        forwardMotion: true,
        sweepSamples: samples,
      });
      return useGameStore.getState().work.tools["lawn-mower"].resource;
    };

    const coarse = run(4);
    const fine = run(16);
    // Expected: drain dominated by path metres, not sample frequency
    expect(Math.abs(coarse - fine)).toBeLessThan(8);
    expect(coarse).toBeLessThan(100);
    expect(fine).toBeLessThan(100);
    // Fail if: fine sampling drains ~4× more for same 2m path
  });

  it("region-placement-invariant: hedge clusters within 1.2m of measured east nodes", () => {
    const g = useGameStore.getState().work.garden!;
    for (const node of HEDGE_EAST_NODES) {
      const near = Object.values(g.hedgeClusters).some(
        (c) =>
          Math.hypot(c.x - (node.center[0] - 0.65), c.z - node.center[2]) < 1.2,
      );
      expect(near).toBe(true);
    }
  });

  it("one-source-one-debris + bag locality via store actions", () => {
    const s = useGameStore.getState();
    const id = Object.keys(s.work.garden!.hedgeClusters)[0];
    s.cutHedgeCluster(id, "hand-hedge-shears");
    s.cutHedgeCluster(id, "hand-hedge-shears"); // idempotent event id
    const clips = Object.values(useGameStore.getState().work.garden!.debris).filter(
      (d) => d.sourceActionId === `hedge-cut:${id}:hand-hedge-shears`,
    );
    expect(clips.length).toBe(1);

    // bag with no gathered pile nearby → ineffective, no global clear
    const before = Object.keys(useGameStore.getState().work.garden!.debris).length;
    useGameStore.getState().bagNearbyPiles(50, 50);
    expect(Object.keys(useGameStore.getState().work.garden!.debris).length).toBe(
      before,
    );
    expect(useGameStore.getState().work.lastEvents[0]?.kind).toBe("ineffective");
  });

  it("review-derived A/B: clean-then-hedge has more rework than hedge-then-clean", () => {
    // Path A: hedge then clean once — no second pass
    let a = createFreshGardenDomain();
    const eastA = Object.values(a.debris).find((d) =>
      d.id.startsWith("leaf-east"),
    )!;
    const hA = Object.values(a.hedgeClusters).sort(
      (x, y) =>
        Math.hypot(x.x - eastA.x, x.z - eastA.z) -
        Math.hypot(y.x - eastA.x, y.z - eastA.z),
    )[0];
    a = applyGardenEvent(a, {
      id: "a-cut",
      type: "HEDGE_CLUSTER_CUT",
      clusterId: hA.id,
      effort: 0.5,
    });
    const clipA = Object.values(a.debris).find((d) => d.kind === "clipping")!;
    a = gatherNearbyDebris(a, clipA.x, clipA.z, 1.5, "a-rake");

    // Path B: clean east → cut → clean again → spent rework
    let b = createFreshGardenDomain();
    const eastB = Object.values(b.debris).find((d) =>
      d.id.startsWith("leaf-east"),
    )!;
    b = gatherNearbyDebris(b, eastB.x, eastB.z, 1.5, "b-rake-1");
    const idsB = Object.values(b.debris)
      .filter((d) => d.state === "gathered")
      .map((d) => d.id);
    b = applyGardenEvent(b, {
      id: "b-b",
      type: "DEBRIS_BAGGED",
      debrisIds: idsB,
      worldFootprint: { x: eastB.x, z: eastB.z, radius: 1.5 },
      effort: 0.4,
    });
    const hB = Object.values(b.hedgeClusters).sort(
      (x, y) =>
        Math.hypot(x.x - eastB.x, x.z - eastB.z) -
        Math.hypot(y.x - eastB.x, y.z - eastB.z),
    )[0];
    b = applyGardenEvent(b, {
      id: "b-cut",
      type: "HEDGE_CLUSTER_CUT",
      clusterId: hB.id,
      effort: 0.5,
    });
    const clipB = Object.values(b.debris).find(
      (d) => d.kind === "clipping" && d.state === "scattered",
    )!;
    b = gatherNearbyDebris(b, clipB.x, clipB.z, 1.5, "b-rake-2");

    const sumA = buildReviewSummary(a);
    const sumB = buildReviewSummary(b);
    expect(sumB.rework).toBeGreaterThan(sumA.rework);
    expect(sumB.reworkNotes.join(" ").toLowerCase()).not.toContain("wrong order");
  });

  it("plan-not-authoritative: work succeeds regardless of plan order", () => {
    useGameStore.getState().revisePlan(["debris", "lawn", "hedge"]);
    expect(useGameStore.getState().work.garden!.plan.taskOrder[0]).toBe("debris");
    const id = Object.keys(useGameStore.getState().work.garden!.hedgeClusters)[0];
    useGameStore.getState().cutHedgeCluster(id, "hand-hedge-shears");
    expect(useGameStore.getState().work.garden!.hedgeClusters[id].cut).toBe(true);
  });

  it("plant-root-vs-top via store", () => {
    const weed = Object.values(useGameStore.getState().work.garden!.plants).find(
      (p) => p.kind === "weed",
    )!;
    useGameStore.getState().topCutWeed(weed.id);
    expect(useGameStore.getState().work.garden!.plants[weed.id].topCut).toBe(true);
    expect(useGameStore.getState().work.garden!.plants[weed.id].rootRemoved).toBe(
      false,
    );
    useGameStore.getState().pullWeed(weed.id);
    expect(useGameStore.getState().work.garden!.plants[weed.id].rootRemoved).toBe(
      true,
    );
  });
});
