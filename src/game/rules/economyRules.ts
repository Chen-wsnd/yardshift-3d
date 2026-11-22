import { getToolById } from "@/data/tools";
import type { GardeningTool, Player } from "@/game/types";

export type PurchaseResult =
  | { ok: true; tool: GardeningTool; newBalance: number }
  | { ok: false; reason: string };

export function canPurchaseTool(
  player: Player,
  toolId: string,
): PurchaseResult {
  const tool = getToolById(toolId);
  if (!tool) {
    return { ok: false, reason: "Unknown tool." };
  }
  if (tool.ownedByDefault || player.ownedToolIds.includes(toolId)) {
    return { ok: false, reason: "You already own this tool." };
  }
  if (player.balance < tool.purchasePrice) {
    return {
      ok: false,
      reason: `Need ${tool.purchasePrice} credits (you have ${player.balance}).`,
    };
  }
  return { ok: true, tool, newBalance: player.balance - tool.purchasePrice };
}

export function canClaimReward(
  jobId: string,
  jobComplete: boolean,
  claimedRewardJobIds: string[],
): { ok: true } | { ok: false; reason: string } {
  if (!jobComplete) {
    return { ok: false, reason: "Finish all required cleanup targets first." };
  }
  if (claimedRewardJobIds.includes(jobId)) {
    return { ok: false, reason: "Reward already claimed." };
  }
  return { ok: true };
}
