/**
 * Pure tool→target eligibility for the global Tool Bar world (GATE-G / TB12).
 * Does not mutate world state — Store ToolUseGuard remains authoritative.
 */

export type HitKind =
  | "lawn"
  | "hedge"
  | "edge"
  | "weed"
  | "flower"
  | "debris"
  | "hazard"
  | "ground"
  | "unknown";

export type CapabilityResult =
  | { allow: true; intendedAction: string }
  | { allow: false; reasonCode: string };

/** Tools exposed in the Saturday garden Tool Bar (Hands = null). */
export const GARDEN_TOOL_BAR_IDS = [
  "manual-reel-mower",
  "lawn-mower",
  "hand-hedge-shears",
  "hedge-trimmer",
  "hand-edger",
  "string-trimmer",
  "hand-weeder",
  "rake",
  "leaf-blower",
  "bag",
] as const;

export type GardenToolBarId = (typeof GARDEN_TOOL_BAR_IDS)[number];

export function resolveToolTarget(
  toolId: string | null,
  hit: { kind: HitKind; id?: string },
): CapabilityResult {
  // Hands / Inspect
  if (toolId == null) {
    if (hit.kind === "hazard") {
      return { allow: true, intendedAction: "inspect-or-clear-hazard" };
    }
    return {
      allow: false,
      reasonCode: "hands-need-hazard",
    };
  }

  switch (toolId) {
    case "manual-reel-mower":
    case "lawn-mower":
      if (hit.kind === "lawn" || hit.kind === "ground") {
        return { allow: true, intendedAction: "mow" };
      }
      return { allow: false, reasonCode: "mower-needs-lawn" };

    case "hand-hedge-shears":
    case "hedge-trimmer":
      if (hit.kind === "hedge") {
        return { allow: true, intendedAction: "cut-hedge" };
      }
      return { allow: false, reasonCode: "shears-need-hedge" };

    case "hand-edger":
      if (hit.kind === "edge") {
        return { allow: true, intendedAction: "edge-work" };
      }
      return { allow: false, reasonCode: "edger-needs-edge" };

    case "string-trimmer":
      if (hit.kind === "edge") {
        return { allow: true, intendedAction: "edge-work" };
      }
      if (hit.kind === "weed") {
        return { allow: true, intendedAction: "top-cut-weed" };
      }
      if (hit.kind === "flower") {
        return { allow: false, reasonCode: "trimmer-risks-flower" };
      }
      return { allow: false, reasonCode: "trimmer-needs-edge-or-weed" };

    case "hand-weeder":
      if (hit.kind === "weed") {
        return { allow: true, intendedAction: "pull-root" };
      }
      if (hit.kind === "flower") {
        return { allow: true, intendedAction: "damage-flower" };
      }
      return { allow: false, reasonCode: "weeder-needs-plant" };

    case "rake":
    case "leaf-blower":
      if (hit.kind === "debris" || hit.kind === "ground") {
        return { allow: true, intendedAction: "gather-debris" };
      }
      return { allow: false, reasonCode: "rake-needs-debris" };

    case "bag":
      if (hit.kind === "debris" || hit.kind === "ground") {
        return { allow: true, intendedAction: "bag-nearby" };
      }
      return { allow: false, reasonCode: "bag-needs-gathered" };

    default:
      return { allow: false, reasonCode: "tool-not-in-garden-bar" };
  }
}

/** Which interaction layers to mount for the selected tool (not activeTaskId). */
export function interactionLayersForTool(
  toolId: string | null,
): Array<"lawn" | "hedge" | "edge" | "flowerbed" | "debris" | "hazard"> {
  if (toolId == null) return ["hazard"];
  switch (toolId) {
    case "manual-reel-mower":
    case "lawn-mower":
      return ["lawn"];
    case "hand-hedge-shears":
    case "hedge-trimmer":
      return ["hedge"];
    case "hand-edger":
      return ["edge"];
    case "string-trimmer":
      return ["edge", "flowerbed"];
    case "hand-weeder":
      return ["flowerbed"];
    case "rake":
    case "leaf-blower":
    case "bag":
      return ["debris"];
    default:
      return [];
  }
}
