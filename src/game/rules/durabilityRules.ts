import type { ToolInstance, ToolProfile } from "@/game/work/types";

export function isToolUsable(tool: ToolInstance): {
  ok: boolean;
  reason?: string;
} {
  if (tool.status === "broken") {
    return { ok: false, reason: "Tool is broken — repair at the workbench." };
  }
  if (tool.status === "jammed") {
    return { ok: false, reason: "Tool is jammed — clear the jam first." };
  }
  if (tool.status === "unpowered" || tool.resource <= 0) {
    if (tool.resourceType === "battery" || tool.resourceType === "fuel") {
      return {
        ok: false,
        reason:
          tool.resourceType === "battery"
            ? "Battery empty — recharge before use."
            : "Fuel empty — refill before use.",
      };
    }
    if (tool.resourceType === "fluid" && tool.resource <= 0) {
      return { ok: false, reason: "Sprayer fluid empty." };
    }
  }
  return { ok: true };
}

/** Empty resource does not damage the engine — only marks unpowered. */
export function markUnpoweredIfEmpty(tool: ToolInstance): ToolInstance {
  if (tool.resourceType === "none") return tool;
  if (tool.resource <= 0 && tool.status === "ready") {
    return { ...tool, status: "unpowered" };
  }
  if (tool.resource > 0 && tool.status === "unpowered") {
    return { ...tool, status: "ready" };
  }
  return tool;
}

export function applyWear(
  tool: ToolInstance,
  profile: ToolProfile,
  strained = false,
): ToolInstance {
  const mult = tool.condition < 20 || strained ? 2 : 1;
  const condition = Math.max(0, tool.condition - profile.wearPerStroke * mult);
  let status = tool.status;
  if (condition <= 0) status = "broken";
  let resource = tool.resource;
  if (tool.resourceType === "battery" || tool.resourceType === "fuel") {
    resource = Math.max(0, resource - 2);
  }
  if (tool.resourceType === "fluid") {
    resource = Math.max(0, resource - 8);
  }
  const next = markUnpoweredIfEmpty({
    ...tool,
    condition,
    resource,
    status: condition <= 0 ? "broken" : status,
  });
  return next;
}

export function repairCost(tool: ToolInstance): number {
  if (tool.power === "manual") return 8;
  if (tool.power === "petrol") return 60;
  return 35;
}

export function applyRepair(tool: ToolInstance): ToolInstance {
  const restored = tool.power === "manual" ? 100 : Math.max(70, tool.condition + 80);
  return {
    ...tool,
    condition: Math.min(100, restored),
    status: "ready",
    jamEventIds: [],
  };
}

export function applyRefill(tool: ToolInstance): ToolInstance {
  return markUnpoweredIfEmpty({
    ...tool,
    resource: 100,
    status: tool.status === "broken" || tool.status === "jammed" ? tool.status : "ready",
  });
}

export function applyClearJam(tool: ToolInstance): ToolInstance {
  if (tool.status !== "jammed") return tool;
  return { ...tool, status: tool.condition <= 0 ? "broken" : "ready" };
}
