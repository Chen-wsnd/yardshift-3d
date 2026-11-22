import { describe, expect, it } from "vitest";
import { INITIAL_PLAYER } from "@/data/player";
import { canClaimReward, canPurchaseTool } from "./economyRules";

describe("canPurchaseTool", () => {
  it("rejects duplicate ownership", () => {
    const result = canPurchaseTool(INITIAL_PLAYER, "rake");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/already own/i);
  });

  it("rejects insufficient funds", () => {
    const broke = { ...INITIAL_PLAYER, balance: 10, ownedToolIds: [...INITIAL_PLAYER.ownedToolIds] };
    const result = canPurchaseTool(broke, "chainsaw");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/Need 100/);
  });

  it("allows purchase when funded and not owned", () => {
    const rich = {
      ...INITIAL_PLAYER,
      balance: 500,
      ownedToolIds: [...INITIAL_PLAYER.ownedToolIds],
    };
    const result = canPurchaseTool(rich, "leaf-blower");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.newBalance).toBe(455);
  });
});

describe("canClaimReward", () => {
  it("requires completion", () => {
    expect(canClaimReward("job-overgrown-lawn", false, []).ok).toBe(false);
  });

  it("allows one claim then rejects duplicates", () => {
    expect(canClaimReward("job-overgrown-lawn", true, []).ok).toBe(true);
    expect(
      canClaimReward("job-overgrown-lawn", true, ["job-overgrown-lawn"]).ok,
    ).toBe(false);
  });
});
