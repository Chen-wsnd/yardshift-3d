import { describe, expect, it } from "vitest";
import { guardAndConsumeTool } from "./toolUseGuard";
import type { ToolInstance } from "@/game/work/types";

describe("guardAndConsumeTool G07", () => {
  it("applies wear on the stroke that depletes battery", () => {
    const tool: ToolInstance = {
      id: "string-trimmer",
      power: "battery",
      resourceType: "battery",
      resource: 2,
      condition: 100,
      status: "ready",
      jamEventIds: [],
    };
    const result = guardAndConsumeTool(tool, "string-trimmer", {
      drain: true,
      wear: true,
    });
    expect(result.ok).toBe(true);
    expect(result.tool.resource).toBe(0);
    expect(result.tool.status).toBe("unpowered");
    expect(result.wearApplied).toBe(true);
    expect(result.tool.condition).toBeLessThan(100);
  });
});
