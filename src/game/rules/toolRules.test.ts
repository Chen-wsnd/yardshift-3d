import { describe, expect, it } from "vitest";
import { evaluateToolUse, isToolCompatible } from "./toolRules";

describe("evaluateToolUse", () => {
  it("allows rake on leaves", () => {
    const result = evaluateToolUse("rake", "leaves", "dirty", "owned");
    expect(result.success).toBe(true);
    expect(result.effectType).toBe("shrink_fade");
  });

  it("allows leaf blower as alternative on leaves", () => {
    expect(evaluateToolUse("leaf-blower", "leaves", "dirty", "loaned").success).toBe(
      true,
    );
  });

  it("rejects incompatible tool with helpful message", () => {
    const result = evaluateToolUse("rake", "hedge", "dirty", "owned");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Hedge Trimmer/i);
  });

  it("rejects decorative targets", () => {
    const result = evaluateToolUse("rake", "decorative", "decorative", "owned");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/decoration/i);
  });

  it("rejects already cleaned objects", () => {
    expect(
      evaluateToolUse("rake", "leaves", "cleaned", "owned").success,
    ).toBe(false);
  });

  it("rejects locked tools", () => {
    expect(
      evaluateToolUse("chainsaw", "fallen_branch", "dirty", "locked").success,
    ).toBe(false);
  });

  it("supports multi-tool weeds (trimmer and herbicide)", () => {
    expect(isToolCompatible("string-trimmer", "weeds")).toBe(true);
    expect(isToolCompatible("herbicide", "weeds")).toBe(true);
    expect(isToolCompatible("rake", "weeds")).toBe(false);
  });
});
