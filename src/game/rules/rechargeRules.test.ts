import { describe, expect, it } from "vitest";
import { EQUIPMENT_PROFILES } from "@/data/equipmentProfiles";
import { applyRecharge, applyWear } from "./durabilityRules";
import type { ToolInstance } from "@/game/work/types";

function batteryTool(overrides: Partial<ToolInstance> = {}): ToolInstance {
  return {
    id: "lawn-mower",
    power: "battery",
    resourceType: "battery",
    resource: 40,
    condition: 90,
    status: "ready",
    jamEventIds: [],
    ...overrides,
  };
}

describe("M0 recharge lifecycle", () => {
  it("recharges battery to 100 and restores unpowered", () => {
    const tool = batteryTool({ resource: 0, status: "unpowered" });
    const res = applyRecharge(tool);
    expect(res.ok).toBe(true);
    expect(res.tool.resource).toBe(100);
    expect(res.tool.status).toBe("ready");
  });

  it("refuses recharge when jammed or broken", () => {
    expect(applyRecharge(batteryTool({ status: "jammed" })).ok).toBe(false);
    expect(applyRecharge(batteryTool({ status: "broken" })).ok).toBe(false);
  });

  it("applyWear can skip resource drain (path drain owns battery)", () => {
    const profile = EQUIPMENT_PROFILES.find((p) => p.id === "lawn-mower")!;
    const worn = applyWear(batteryTool({ resource: 50 }), profile, false, {
      drainResource: false,
    });
    expect(worn.resource).toBe(50);
    expect(worn.condition).toBeLessThan(90);
  });
});
