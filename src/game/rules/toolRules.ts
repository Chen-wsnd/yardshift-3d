import { getToolById, TOOLS } from "@/data/tools";
import type {
  GardeningTool,
  ObjectInteractionState,
  TargetKind,
  ToolAvailability,
  ToolEffectType,
  ToolInteractionResult,
} from "@/game/types";

/**
 * Pure tool→target evaluation. State actions apply results only on success.
 */
export function evaluateToolUse(
  toolId: string | null,
  targetKind: TargetKind,
  objectStatus: ObjectInteractionState,
  availability: ToolAvailability,
): ToolInteractionResult {
  if (objectStatus === "decorative" || targetKind === "decorative") {
    return {
      success: false,
      message: "That's decoration — it doesn't need cleanup.",
      effectType: "none",
    };
  }

  if (objectStatus === "cleaned") {
    return {
      success: false,
      message: "Already cleaned.",
      effectType: "none",
    };
  }

  if (!toolId) {
    return {
      success: false,
      message: "Select a tool first.",
      effectType: "none",
    };
  }

  if (availability === "locked") {
    return {
      success: false,
      message: "That tool is locked. Buy it in the shop or use a loaner.",
      effectType: "none",
    };
  }

  const tool = getToolById(toolId);
  if (!tool) {
    return {
      success: false,
      message: "Unknown tool.",
      effectType: "none",
    };
  }

  if (!tool.compatibleTargets.includes(targetKind)) {
    const recommended = recommendToolForTarget(targetKind);
    return {
      success: false,
      message: recommended
        ? `${tool.name} can't clear this. Try the ${recommended.name}.`
        : `${tool.name} isn't right for this target.`,
      effectType: "none",
    };
  }

  return {
    success: true,
    message: `${tool.name} worked — ${targetKind.replaceAll("_", " ")} cleared.`,
    effectType: tool.visualEffect as ToolEffectType,
  };
}

export function recommendToolForTarget(
  targetKind: TargetKind,
): GardeningTool | undefined {
  return TOOLS.find((t) => t.compatibleTargets.includes(targetKind));
}

export function isToolCompatible(
  toolId: string,
  targetKind: TargetKind,
): boolean {
  const tool = getToolById(toolId);
  return Boolean(tool?.compatibleTargets.includes(targetKind));
}
