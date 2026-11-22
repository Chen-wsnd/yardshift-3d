import { getProfile } from "@/data/equipmentProfiles";
import { applyWear, isToolUsable } from "@/game/rules/durabilityRules";
import type { ToolInstance } from "@/game/work/types";

export interface ToolUseGuardResult {
  ok: boolean;
  reason?: string;
  tool: ToolInstance;
  resourceDelta: number;
  wearApplied: boolean;
}

const POWERED_DRAIN: Record<string, number> = {
  "lawn-mower": 0, // path metres handled in lawnSweep
  "hedge-trimmer": 4,
  "leaf-blower": 3.5,
  "string-trimmer": 3,
};

/**
 * Unified ready/resource check + optional per-action drain for non-lawn tools.
 * G07: when this action depletes battery, still apply normal wear for the successful work.
 */
export function guardAndConsumeTool(
  tool: ToolInstance,
  toolId: string,
  opts?: { drain?: boolean; wear?: boolean },
): ToolUseGuardResult {
  const usable = isToolUsable(tool);
  if (!usable.ok) {
    return {
      ok: false,
      reason: usable.reason,
      tool,
      resourceDelta: 0,
      wearApplied: false,
    };
  }

  let next = tool;
  let resourceDelta = 0;
  const drain = opts?.drain !== false;
  const doWear = opts?.wear !== false;
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
  }

  // Always settle wear for a successful committed action — including the depleting stroke (G07)
  let wearApplied = false;
  if (doWear && profile) {
    next = applyWear(next, profile, false, { drainResource: false });
    wearApplied = true;
  }

  return {
    ok: true,
    tool: next,
    resourceDelta,
    wearApplied,
    reason:
      next.resource <= 0 && resourceDelta > 0
        ? "Resource depleted after this action."
        : undefined,
  };
}

export function footprintsOverlap(
  a: { x: number; z: number; radius: number },
  b: { x: number; z: number; radius: number },
): boolean {
  const d = Math.hypot(a.x - b.x, a.z - b.z);
  return d <= a.radius + b.radius;
}

/** Manual tools: apply a small condition drop only when work actually happened. */
export function applyManualWorkWear(
  tool: ToolInstance,
  toolId: string,
  units = 1,
): ToolInstance {
  const profile = getProfile(toolId);
  if (!profile) return tool;
  let next = tool;
  for (let i = 0; i < units; i++) {
    next = applyWear(next, profile, false, { drainResource: false });
  }
  return next;
}
