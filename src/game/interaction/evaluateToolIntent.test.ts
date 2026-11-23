import { describe, expect, it } from "vitest";
import { createFreshGardenDomain } from "@/game/garden/fixtures";
import { evaluateToolIntent } from "./evaluateToolIntent";
import type { ToolInstance } from "@/game/work/types";

function tool(
  partial: Partial<ToolInstance> & { id: string },
): ToolInstance {
  return {
    power: "battery",
    resourceType: "battery",
    resource: 100,
    condition: 100,
    status: "ready",
    jamEventIds: [],
    ...partial,
  };
}

describe("evaluateToolIntent (preview, zero side effects)", () => {
  it("marks stone proximity as risk without requiring commit", () => {
    const garden = createFreshGardenDomain();
    const stone = garden.hazards["lawn-stone-1"];
    const intent = evaluateToolIntent(
      "lawn-mower",
      { kind: "lawn", x: stone.x, z: stone.z },
      {
        garden,
        tool: tool({ id: "lawn-mower" }),
      },
    );
    expect(intent.level).toBe("risk");
    expect(intent.warnsAbnormalWear).toBe(true);
    expect(intent.reasonCode).toMatch(/stone/);
  });

  it("does not risk far from stone", () => {
    const garden = createFreshGardenDomain();
    const intent = evaluateToolIntent(
      "lawn-mower",
      { kind: "lawn", x: 0, z: 0 },
      { garden, tool: tool({ id: "lawn-mower" }) },
    );
    expect(intent.level).not.toBe("risk");
  });

  it("flags flower pull as risk; already-top-cut as ineffective", () => {
    const garden = createFreshGardenDomain();
    const flower = Object.values(garden.plants).find((p) => p.kind === "flower")!;
    const weed = Object.values(garden.plants).find((p) => p.kind === "weed")!;
    garden.plants[weed.id] = { ...weed, topCut: true, rootRemoved: false };

    const flowerIntent = evaluateToolIntent(
      "hand-weeder",
      { kind: "flower", id: flower.id },
      { garden, tool: tool({ id: "hand-weeder", resourceType: "none", power: "manual" }) },
    );
    expect(flowerIntent.level).toBe("risk");
    expect(flowerIntent.allowCommit).toBe(true);

    const topIntent = evaluateToolIntent(
      "string-trimmer",
      { kind: "weed", id: weed.id },
      { garden, tool: tool({ id: "string-trimmer" }) },
    );
    expect(topIntent.level).toBe("ineffective");
    expect(topIntent.allowCommit).toBe(false);
  });

  it("legacy hardwood hazard still teaches mark-and-avoid", () => {
    const garden = createFreshGardenDomain();
    garden.hazards["hedge-hardwood-1"] = {
      id: "hedge-hardwood-1",
      x: 6.35,
      z: 1.0,
      cleared: false,
      blocks: ["hedge-trimmer"],
      label: "Thick entangled wood in the hedge",
      requiredForReview: false,
    };
    garden.inspection["hedge-hardwood-1"] = {
      observed: true,
      effort: 0.3,
    };
    const intent = evaluateToolIntent(
      null,
      { kind: "hazard", id: "hedge-hardwood-1" },
      { garden },
    );
    expect(intent.level).toBe("ineffective");
    expect(intent.reasonCode).toBe("intent.hardwood-needs-tool");
  });

  it("unavailable when battery empty", () => {
    const garden = createFreshGardenDomain();
    const intent = evaluateToolIntent(
      "leaf-blower",
      { kind: "debris" },
      {
        garden,
        tool: tool({ id: "leaf-blower", resource: 0, status: "unpowered" }),
      },
    );
    expect(intent.level).toBe("unavailable");
    expect(intent.suggestedAction).toBe("recharge");
  });

  it("fresh yard has no required hardwood hazard", () => {
    const garden = createFreshGardenDomain();
    expect(garden.hazards["hedge-hardwood-1"]).toBeUndefined();
    expect(garden.hazards["lawn-stone-1"]?.requiredForReview).not.toBe(false);
  });
});
