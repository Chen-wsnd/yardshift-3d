import { getProfile } from "@/data/equipmentProfiles";
import { applyWear, isToolUsable } from "@/game/rules/durabilityRules";
import type { ToolInstance } from "@/game/work/types";

export interface ToolUseGuardResult {
  ok: boolean;
  reason?: string;
  tool: ToolInstance;
  resourceDelta: number;
}

const POWERED_DRAIN: Record<string, number> = {
  "lawn-mower": 0, // path metres handled in lawnSweep
  "hedge-trimmer": 4,
  "leaf-blower": 3.5,
  "string-trimmer": 3,
};

/** Unified ready/resource check + optional per-action drain for non-lawn tools. */
export function guardAndConsumeTool(
  tool: ToolInstance,
  toolId: string,
  opts?: { drain?: boolean; wear?: boolean },
): ToolUseGuardResult {
  const usable = isToolUsable(tool);
  if (!usable.ok) {
    return { ok: false, reason: usable.reason, tool, resourceDelta: 0 };
  }

  let next = tool;
  let resourceDelta = 0;
  const drain = opts?.drain !== false;
  const profile = getProfile(toolId);

  if (drain && POWERED_DRAIN[toolId] != null && POWERED_DRAIN[toolId]! > 0) {
    const amount = POWERED_DRAIN[toolId]!;
    const before = next.resource;
    const resource = Math.max(0, next.resource - amount);
    resourceDelta = before - resource;
    next = {
      ...next,
      resource,
      status: resource <= 0 ? "unpowered" : next.status,
    };
    if (resource <= 0) {
      return {
        ok: true,
        tool: next,
        resourceDelta,
        reason: "Resource depleted after this action.",
      };
    }
  }

  if (opts?.wear !== false && profile) {
    next = applyWear(next, profile, false, { drainResource: false });
  }

  return { ok: true, tool: next, resourceDelta };
}

export function footprintsOverlap(
  a: { x: number; z: number; radius: number },
  b: { x: number; z: number; radius: number },
): boolean {
  const d = Math.hypot(a.x - b.x, a.z - b.z);
  return d <= a.radius + b.radius;
}
