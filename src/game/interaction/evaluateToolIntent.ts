/**
 * Side-effect-free preflight (G05 / S2).
 * Preview never mutates world or tools.
 */
import type { GardenDomain } from "@/game/garden/types";
import type { ToolInstance } from "@/game/work/types";
import {
  resolveToolTarget,
  type HitKind,
} from "./toolTargetCapabilities";

export type IntentLevel =
  | "info"
  | "valid"
  | "ineffective"
  | "risk"
  | "unavailable";

export interface ToolIntent {
  level: IntentLevel;
  reasonCode: string;
  allowCommit: boolean;
  /** Extra wear only if a future contact event is committed — never on hover */
  warnsAbnormalWear: boolean;
  suggestedAction?: string;
}

export function evaluateToolIntent(
  toolId: string | null,
  hit: { kind: HitKind; id?: string; x?: number; z?: number } | null,
  ctx: {
    garden: GardenDomain | null | undefined;
    tool?: ToolInstance | null;
  },
): ToolIntent {
  if (!hit) {
    return {
      level: "info",
      reasonCode: "intent.no-target",
      allowCommit: false,
      warnsAbnormalWear: false,
    };
  }

  const tool = ctx.tool;
  if (toolId && tool) {
    if (tool.status === "broken") {
      return {
        level: "unavailable",
        reasonCode: "intent.tool-broken",
        allowCommit: false,
        warnsAbnormalWear: false,
        suggestedAction: "repair",
      };
    }
    if (tool.status === "jammed") {
      return {
        level: "unavailable",
        reasonCode: "intent.tool-jammed",
        allowCommit: false,
        warnsAbnormalWear: false,
        suggestedAction: "clear-jam",
      };
    }
    if (
      (tool.resourceType === "battery" || tool.resourceType === "fuel") &&
      (tool.resource <= 0 || tool.status === "unpowered")
    ) {
      return {
        level: "unavailable",
        reasonCode: "intent.tool-empty",
        allowCommit: false,
        warnsAbnormalWear: false,
        suggestedAction: "recharge",
      };
    }
  }

  const garden = ctx.garden;
  // Hazard proximity risk for blades — only when pointer is near the hazard
  if (
    garden &&
    (toolId === "lawn-mower" ||
      toolId === "manual-reel-mower" ||
      toolId === "hedge-trimmer") &&
    (hit.kind === "lawn" ||
      hit.kind === "hedge" ||
      hit.kind === "ground" ||
      hit.kind === "hazard")
  ) {
    const px = hit.x;
    const pz = hit.z;
    const nearby = Object.values(garden.hazards).find((h) => {
      if (h.cleared) return false;
      if (!toolId || !h.blocks.includes(toolId)) return false;
      if (hit.kind === "hazard" && hit.id) return h.id === hit.id;
      if (px == null || pz == null) return false;
      return (h.x - px) ** 2 + (h.z - pz) ** 2 <= 1.6 * 1.6;
    });
    if (nearby && !garden.inspection[nearby.id]?.observed) {
      return {
        level: "risk",
        reasonCode:
          nearby.id.includes("stone") ||
          nearby.label.toLowerCase().includes("stone")
            ? "intent.risk-stone-uninspected"
            : "intent.risk-hardwood-uninspected",
        allowCommit: true,
        warnsAbnormalWear: true,
        suggestedAction: "inspect-hazard",
      };
    }
    if (nearby && garden.inspection[nearby.id]?.observed) {
      return {
        level: "risk",
        reasonCode:
          nearby.id.includes("stone") ||
          nearby.label.toLowerCase().includes("stone")
            ? "intent.risk-stone-blocks"
            : "intent.risk-hardwood-blocks",
        allowCommit: false,
        // Blocked path — no contact wear is applied by current rules
        warnsAbnormalWear: false,
        suggestedAction: "clear-or-avoid",
      };
    }
  }

  if (hit.kind === "debris" && toolId === "bag") {
    const d = hit.id && garden?.debris[hit.id];
    if (!d || d.state === "scattered") {
      return {
        level: "ineffective",
        reasonCode: "intent.bag-needs-pile",
        allowCommit: false,
        warnsAbnormalWear: false,
        suggestedAction: "rake-first",
      };
    }
  }
  if (hit.kind === "ground" && toolId === "leaf-blower") {
    return {
      level: "ineffective",
      reasonCode: "intent.blow-empty",
      allowCommit: false,
      warnsAbnormalWear: false,
    };
  }

  if (hit.kind === "hazard" && toolId == null) {
    const h = hit.id && garden?.hazards[hit.id];
    const seen = hit.id ? garden?.inspection[hit.id]?.observed : false;
    if (!seen) {
      return {
        level: "valid",
        reasonCode: "intent.hazard-inspect",
        allowCommit: true,
        warnsAbnormalWear: false,
        suggestedAction: "inspect",
      };
    }
    if (h && h.blocks.includes("hedge-trimmer")) {
      return {
        level: "ineffective",
        reasonCode: "intent.hardwood-needs-tool",
        allowCommit: false,
        warnsAbnormalWear: false,
        suggestedAction: "mark-and-avoid",
      };
    }
    return {
      level: "valid",
      reasonCode: "intent.hazard-clear-stone",
      allowCommit: true,
      warnsAbnormalWear: false,
      suggestedAction: "move-aside",
    };
  }

  if (hit.kind === "flower" && toolId === "hand-weeder") {
    return {
      level: "risk",
      reasonCode: "intent.risk-flower-pull",
      allowCommit: true,
      warnsAbnormalWear: false,
      suggestedAction: "confirm-mispull",
    };
  }
  if (hit.kind === "flower" && toolId === "string-trimmer") {
    return {
      level: "risk",
      reasonCode: "intent.risk-flower-trim",
      allowCommit: true,
      warnsAbnormalWear: false,
    };
  }
  if (hit.kind === "weed" && toolId === "string-trimmer") {
    const p = hit.id ? garden?.plants[hit.id] : undefined;
    if (p?.topCut && !p.rootRemoved) {
      return {
        level: "ineffective",
        reasonCode: "intent.already-top-cut",
        allowCommit: false,
        warnsAbnormalWear: false,
        suggestedAction: "use-weeder",
      };
    }
    return {
      level: "valid",
      reasonCode: "intent.top-cut-ok",
      allowCommit: true,
      warnsAbnormalWear: false,
    };
  }

  const cap = resolveToolTarget(toolId, hit);
  if (!cap.allow) {
    return {
      level: "ineffective",
      reasonCode: `intent.${cap.reasonCode}`,
      allowCommit: false,
      warnsAbnormalWear: false,
    };
  }
  return {
    level: "valid",
    reasonCode: `intent.${cap.intendedAction}`,
    allowCommit: true,
    warnsAbnormalWear: false,
  };
}
