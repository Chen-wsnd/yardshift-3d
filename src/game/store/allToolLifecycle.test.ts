import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "./gameStore";

describe("all-tool lifecycle (T09–T11, T15)", () => {
  beforeEach(() => {
    useGameStore.getState().startV03Garden();
  });

  it("hedge trimmer 0 battery refuses cut", () => {
    const s = useGameStore.getState();
    useGameStore.setState({
      work: {
        ...s.work,
        tools: {
          ...s.work.tools,
          "hedge-trimmer": {
            ...s.work.tools["hedge-trimmer"],
            resource: 0,
            status: "unpowered",
          },
        },
      },
    });
    const id = Object.keys(useGameStore.getState().work.garden!.hedgeClusters)[0];
    useGameStore.getState().cutHedgeCluster(id, "hedge-trimmer");
    expect(
      useGameStore.getState().work.garden!.hedgeClusters[id].cut,
    ).toBe(false);
    expect(useGameStore.getState().work.lastEvents[0]?.kind).toBe("not_powered");
  });

  it("leaf blower drains battery on blow", () => {
    useGameStore.getState().selectTool("leaf-blower");
    const before = useGameStore.getState().work.tools["leaf-blower"].resource;
    const leaf = Object.values(useGameStore.getState().work.garden!.debris)[0];
    useGameStore.getState().blowDebris(leaf.x, leaf.z, 1, 0);
    const after = useGameStore.getState().work.tools["leaf-blower"].resource;
    expect(after).toBeLessThan(before);
  });

  it("string trimmer 0 battery refuses top cut via store guard path on edge", () => {
    useGameStore.setState({
      work: {
        ...useGameStore.getState().work,
        selectedToolId: "string-trimmer",
        tools: {
          ...useGameStore.getState().work.tools,
          "string-trimmer": {
            ...useGameStore.getState().work.tools["string-trimmer"],
            resource: 0,
            status: "unpowered",
          },
        },
      },
    });
    useGameStore.getState().applyEdgeWork(0, -3.55, [{ x: 0, z: -3.55 }]);
    expect(useGameStore.getState().work.lastEvents[0]?.kind).toBe("not_powered");
  });
});
