import { describe, expect, it } from "vitest";
import {
  GARDEN_TOOL_BAR_IDS,
  interactionLayersForTool,
  resolveToolTarget,
} from "./toolTargetCapabilities";

describe("toolTargetCapabilities (TB12)", () => {
  it("exposes 10 garden work tools", () => {
    expect(GARDEN_TOOL_BAR_IDS).toHaveLength(10);
  });

  it("hands only allows hazard", () => {
    expect(resolveToolTarget(null, { kind: "hazard" }).allow).toBe(true);
    expect(resolveToolTarget(null, { kind: "lawn" }).allow).toBe(false);
  });

  it("mower rejects hedge; shears reject lawn", () => {
    expect(resolveToolTarget("lawn-mower", { kind: "hedge" }).allow).toBe(
      false,
    );
    expect(
      resolveToolTarget("hand-hedge-shears", { kind: "lawn" }).allow,
    ).toBe(false);
    expect(resolveToolTarget("hand-hedge-shears", { kind: "hedge" }).allow).toBe(
      true,
    );
  });

  it("string-trimmer allows edge and weed, not flower as allow-work", () => {
    expect(resolveToolTarget("string-trimmer", { kind: "edge" }).allow).toBe(
      true,
    );
    expect(resolveToolTarget("string-trimmer", { kind: "weed" }).allow).toBe(
      true,
    );
    expect(resolveToolTarget("string-trimmer", { kind: "flower" }).allow).toBe(
      false,
    );
  });

  it("layers follow selected tool, not task stage", () => {
    expect(interactionLayersForTool(null)).toEqual(["hazard"]);
    expect(interactionLayersForTool("rake")).toEqual(["debris"]);
    expect(interactionLayersForTool("string-trimmer")).toEqual([
      "edge",
      "flowerbed",
    ]);
    expect(interactionLayersForTool("manual-reel-mower")).toEqual(["lawn"]);
  });
});
