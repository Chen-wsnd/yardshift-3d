import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "./gameStore";

describe("v0.6 garden store wiring", () => {
  beforeEach(() => {
    useGameStore.getState().startV03Garden();
  });

  it("starts with garden domain and no active task", () => {
    const { work } = useGameStore.getState();
    expect(work.schemaVersion).toBe(3);
    expect(work.garden).toBeTruthy();
    expect(work.garden!.activeTaskId).toBeNull();
    expect(Object.keys(work.garden!.hedgeClusters).length).toBeGreaterThan(0);
  });

  it("recharge restores battery and records recovery effort", () => {
    const store = useGameStore.getState();
    useGameStore.setState({
      work: {
        ...store.work,
        tools: {
          ...store.work.tools,
          "lawn-mower": {
            ...store.work.tools["lawn-mower"],
            resource: 5,
            status: "unpowered",
          },
        },
      },
    });
    const res = useGameStore.getState().rechargeTool("lawn-mower");
    expect(res.ok).toBe(true);
    const { work } = useGameStore.getState();
    expect(work.tools["lawn-mower"].resource).toBe(100);
    expect(work.tools["lawn-mower"].status).toBe("ready");
    expect(work.garden!.effort.recovery).toBeGreaterThan(0);
  });

  it("hedge cut then bag path creates rework when trimmed after clean", () => {
    const s = useGameStore.getState();
    const hedgeId = Object.keys(s.work.garden!.hedgeClusters)[0];
    s.cutHedgeCluster(hedgeId, "hand-hedge-shears");
    let garden = useGameStore.getState().work.garden!;
    const clip = Object.values(garden.debris).find((d) => d.kind === "clipping")!;
    useGameStore.getState().rakeDebris(clip.x, clip.z, 0, 0.2);
    garden = useGameStore.getState().work.garden!;
    const pile = Object.values(garden.debris).find((d) => d.state === "gathered");
    expect(pile).toBeTruthy();
    useGameStore.getState().bagNearbyPiles(pile!.x, pile!.z);
    const other = Object.keys(useGameStore.getState().work.garden!.hedgeClusters).find(
      (id) => !useGameStore.getState().work.garden!.hedgeClusters[id].cut,
    )!;
    useGameStore.getState().cutHedgeCluster(other, "hand-hedge-shears");
    const events = useGameStore.getState().work.garden!.events;
    expect(events.some((e) => e.type === "DEBRIS_SPAWNED")).toBe(true);
    expect(events.some((e) => e.type === "DEBRIS_BAGGED")).toBe(true);
  });

  it("setActiveGardenTask focuses lawn zone for lawn task", () => {
    useGameStore.getState().setActiveGardenTask("lawn");
    const { work } = useGameStore.getState();
    expect(work.garden!.activeTaskId).toBe("lawn");
    expect(work.focusedZoneId).toBe("j1-lawn");
  });
});
