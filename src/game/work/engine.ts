import { getProfile } from "@/data/equipmentProfiles";
import {
  applyWear,
  isToolUsable,
  markUnpoweredIfEmpty,
} from "@/game/rules/durabilityRules";
import { updateJobMetrics } from "@/game/rules/qualityRules";
import { applyLawnSweep } from "./lawnSweep";
import type {
  ToolInstance,
  WorkAction,
  WorkCell,
  WorkEvent,
  WorkSnapshot,
  WorkZone,
} from "./types";

function dist2(ax: number, az: number, bx: number, bz: number) {
  const dx = ax - bx;
  const dz = az - bz;
  return dx * dx + dz * dz;
}

function cellsInRadius(
  zone: WorkZone,
  worldX: number,
  worldZ: number,
  radius: number,
  maxCells: number,
): WorkCell[] {
  const r2 = radius * radius;
  return [...zone.cells]
    .filter((c) => !c.isPile)
    .map((c) => ({
      c,
      d: dist2(c.localX, c.localZ, worldX, worldZ),
    }))
    .filter((x) => x.d <= r2)
    .sort((a, b) => a.d - b.d)
    .slice(0, maxCells)
    .map((x) => x.c);
}

function pushEvent(
  events: WorkEvent[],
  e: Omit<WorkEvent, "id"> & { id?: string },
) {
  events.push({
    id: e.id ?? `evt-${events.length}-${e.kind}`,
    ...e,
  });
}

function hasDamageKey(snap: WorkSnapshot, key: string) {
  return snap.damageKeys.includes(key);
}

function withDamageKey(snap: WorkSnapshot, key: string): WorkSnapshot {
  if (snap.damageKeys.includes(key)) return snap;
  return { ...snap, damageKeys: [...snap.damageKeys, key] };
}

function updateCell(
  zones: WorkZone[],
  zoneId: string,
  cellId: string,
  fn: (c: WorkCell) => WorkCell,
): WorkZone[] {
  return zones.map((z) =>
    z.id !== zoneId
      ? z
      : {
          ...z,
          cells: z.cells.map((c) => (c.id === cellId ? fn(c) : c)),
        },
  );
}

function setTool(
  snap: WorkSnapshot,
  toolId: string,
  tool: ToolInstance,
): WorkSnapshot {
  return { ...snap, tools: { ...snap.tools, [toolId]: tool } };
}

/**
 * Pure deterministic work reducer — authoritative gameplay outcomes.
 */
export function applyWorkAction(
  snapshot: WorkSnapshot,
  action: WorkAction,
): { nextState: WorkSnapshot; events: WorkEvent[] } {
  const events: WorkEvent[] = [];
  let snap = structuredClone(snapshot) as WorkSnapshot;

  const job = snap.jobs[action.jobId];
  if (!job || job.settled) {
    pushEvent(events, {
      kind: "ineffective",
      zoneId: action.zoneId,
      toolId: action.toolId,
      explanation: "No active unsettled job.",
    });
    return { nextState: snap, events };
  }

  const zone = job.zones.find((z) => z.id === action.zoneId);
  if (!zone) {
    pushEvent(events, {
      kind: "ineffective",
      zoneId: action.zoneId,
      toolId: action.toolId,
      explanation: "Unknown work zone.",
    });
    return { nextState: snap, events };
  }

  const profile = getProfile(action.toolId);
  let tool = snap.tools[action.toolId];
  if (!profile || !tool) {
    pushEvent(events, {
      kind: "ineffective",
      zoneId: action.zoneId,
      toolId: action.toolId,
      explanation: "Unknown tool.",
    });
    return { nextState: snap, events };
  }

  const owned =
    snap.ownedToolIds.includes(action.toolId) ||
    snap.rentedToolIds.includes(action.toolId);
  if (!owned) {
    pushEvent(events, {
      kind: "ineffective",
      zoneId: action.zoneId,
      toolId: action.toolId,
      explanation: "You don't have this tool. Buy or rent it first.",
    });
    return { nextState: snap, events };
  }

  // P0 lawn path batch — single authoritative update for drag samples
  if (action.sweepSamples && action.sweepSamples.length > 0) {
    return applyLawnSweep(snap, action);
  }

  // Service actions
  if (action.action === "clear_jam") {
    if (tool.status !== "jammed") {
      pushEvent(events, {
        kind: "ineffective",
        zoneId: action.zoneId,
        toolId: action.toolId,
        explanation: "Nothing to clear.",
      });
      return { nextState: snap, events };
    }
    tool = { ...tool, status: tool.condition <= 0 ? "broken" : "ready" };
    snap = setTool(snap, action.toolId, tool);
    pushEvent(events, {
      kind: "repaired",
      zoneId: action.zoneId,
      toolId: action.toolId,
      explanation: "Jam cleared. Tool is ready again.",
    });
    return { nextState: { ...snap, lastEvents: events }, events };
  }

  tool = markUnpoweredIfEmpty(tool);
  const usable = isToolUsable(tool);
  if (!usable.ok) {
    pushEvent(events, {
      kind: tool.status === "unpowered" || tool.resource <= 0 ? "not_powered" : tool.status === "jammed" ? "jammed" : "broken",
      zoneId: action.zoneId,
      toolId: action.toolId,
      explanation: usable.reason ?? "Tool cannot work.",
    });
    snap = setTool(snap, action.toolId, tool);
    return { nextState: { ...snap, lastEvents: events }, events };
  }

  if (!profile.compatibleZoneKinds.includes(zone.kind)) {
    pushEvent(events, {
      kind: "ineffective",
      zoneId: action.zoneId,
      toolId: action.toolId,
      explanation: `${profile.name} isn't suited to the ${zone.name}.`,
    });
    return { nextState: snap, events };
  }

  // Bagging requires a pile with gathered leaves
  if (profile.actionKind === "bag") {
    const pile = zone.cells.find((c) => c.isPile);
    const gathered = zone.cells.filter(
      (c) =>
        !c.isPile &&
        (c.result === "partial" || c.tags.includes("gathered")) &&
        !c.collected,
    );
    if (!pile || gathered.length === 0) {
      pushEvent(events, {
        kind: "ineffective",
        zoneId: action.zoneId,
        toolId: action.toolId,
        explanation: "Nothing gathered to bag yet. Rake or blow leaves into a pile first.",
      });
      return { nextState: snap, events };
    }
    let zones = job.zones;
    for (const g of gathered) {
      zones = updateCell(zones, zone.id, g.id, (c) => ({
        ...c,
        remainingWork: 0,
        result: "bagged",
        collected: true,
        tags: [...c.tags.filter((t) => t !== "gathered"), "bagged"],
      }));
    }
    zones = updateCell(zones, zone.id, pile.id, (c) => ({
      ...c,
      result: "bagged",
      collected: true,
    }));
    tool = applyWear(tool, profile);
    snap = setTool(snap, action.toolId, tool);
    const nextJob = updateJobMetrics({
      ...job,
      zones,
      workActions: job.workActions + 1,
    });
    snap = {
      ...snap,
      jobs: { ...snap.jobs, [action.jobId]: nextJob },
      lastEvents: events,
    };
    pushEvent(events, {
      kind: "bagged",
      zoneId: zone.id,
      toolId: action.toolId,
      explanation: "Bagged the gathered pile.",
    });
    return { nextState: snap, events };
  }

  const targets = cellsInRadius(
    zone,
    action.worldX,
    action.worldZ,
    profile.coverageRadius,
    profile.maxCellsPerStroke,
  );

  if (targets.length === 0) {
    pushEvent(events, {
      kind: "ineffective",
      zoneId: zone.id,
      toolId: action.toolId,
      explanation: "No work under the tool stroke.",
    });
    return { nextState: snap, events };
  }

  let zones = job.zones;
  let qualityDelta = 0;
  let progressed = false;

  for (const target of targets) {
    // Jam only on visibly entangled wood (solvable hedges remain workable)
    if (
      (action.toolId === "hand-hedge-shears" || action.toolId === "loppers") &&
      target.tags.includes("entangled") &&
      target.remainingWork > 0
    ) {
      const jamKey = `${action.jobId}:${action.toolId}:jam:${target.id}`;
      if (!tool.jamEventIds.includes(jamKey)) {
        tool = {
          ...tool,
          status: "jammed",
          condition: Math.max(0, tool.condition - 15),
          jamEventIds: [...tool.jamEventIds, jamKey],
        };
        if (tool.condition <= 0) tool.status = "broken";
        pushEvent(events, {
          kind: "jammed",
          zoneId: zone.id,
          toolId: action.toolId,
          cellId: target.id,
          explanation:
            "The blades snagged on thick entangled wood. Clear the jam before continuing.",
          damageKey: jamKey,
        });
        snap = setTool(snap, action.toolId, tool);
        return { nextState: { ...snap, lastEvents: events }, events };
      }
    }

    // Flower damage from imprecise tools or mistaken weeding
    if (
      target.protectedKind === "flower" &&
      (action.toolId === "hand-weeder" ||
        (profile.precision < 0.7 &&
          (profile.actionKind === "shape" ||
            profile.actionKind === "cut" ||
            profile.actionKind === "treat")))
    ) {
      const dmgKey = `${action.jobId}:${zone.id}:${target.id}:flower_damaged`;
      if (!hasDamageKey(snap, dmgKey)) {
        snap = withDamageKey(snap, dmgKey);
        zones = updateCell(zones, zone.id, target.id, (c) => ({
          ...c,
          result: "flower_damaged",
          damageKinds: [...new Set([...c.damageKinds, "flower_damaged"])],
        }));
        qualityDelta -= 8;
        pushEvent(events, {
          kind: "environment_damaged",
          zoneId: zone.id,
          toolId: action.toolId,
          cellId: target.id,
          qualityDelta: -8,
          costCredits: 12,
          explanation:
            action.toolId === "hand-weeder"
              ? "You pulled a protected flower by mistake. The damage stays for this job."
              : "The wide stroke clipped a protected flower. It stays damaged for this contract.",
          damageKey: dmgKey,
        });
      }
      // weeder on flower: damage only, no progress on flower cell as weed
      if (action.toolId === "hand-weeder" && target.protectedKind === "flower") {
        continue;
      }
    }

    // Leaf rake / blower: gather toward pile, don't finish removal
    if (profile.actionKind === "rake" || profile.actionKind === "blow") {
      if (target.tags.includes("litter") && profile.actionKind === "blow") {
        // blower moves litter poorly — still gather tag
      }
      // Wrong blow direction scatters
      if (
        profile.actionKind === "blow" &&
        action.direction &&
        action.direction[0] < 0
      ) {
        const scatterKey = `${action.jobId}:${zone.id}:${target.id}:scattered`;
        zones = updateCell(zones, zone.id, target.id, (c) => ({
          ...c,
          result: "scattered",
          tags: [...new Set([...c.tags, "scattered"])],
          remainingWork: Math.min(100, c.remainingWork + 15),
        }));
        if (!hasDamageKey(snap, scatterKey)) {
          snap = withDamageKey(snap, scatterKey);
          pushEvent(events, {
            kind: "scattered",
            zoneId: zone.id,
            toolId: action.toolId,
            cellId: target.id,
            explanation:
              "Wrong blow direction scattered debris into the bed — extra cleanup now.",
            damageKey: scatterKey,
          });
        }
        progressed = true;
        continue;
      }

      zones = updateCell(zones, zone.id, target.id, (c) => ({
        ...c,
        remainingWork: Math.max(0, c.remainingWork - profile.workPerStroke),
        result: c.remainingWork - profile.workPerStroke <= 0 ? "partial" : "partial",
        tags: [...new Set([...c.tags, "gathered"])],
      }));
      progressed = true;
      pushEvent(events, {
        kind: "progress",
        zoneId: zone.id,
        toolId: action.toolId,
        cellId: target.id,
        explanation: "Leaves moved toward the pile. Bag them to finish.",
      });
      continue;
    }

    // String trimmer in flowerbed → stubble, not root removal
    if (
      action.toolId === "string-trimmer" &&
      zone.kind === "flowerbed" &&
      target.tags.includes("weed")
    ) {
      zones = updateCell(zones, zone.id, target.id, (c) => ({
        ...c,
        remainingWork: Math.max(20, c.remainingWork - profile.workPerStroke),
        result: "stubble",
        tags: [...new Set([...c.tags, "stubble"])],
      }));
      progressed = true;
      pushEvent(events, {
        kind: "stubble",
        zoneId: zone.id,
        toolId: action.toolId,
        cellId: target.id,
        explanation:
          "Trimmer only cut the tops. Roots remain — use a hand weeder to finish.",
      });
      continue;
    }

    // Herbicide → pending treatment
    if (profile.actionKind === "treat") {
      zones = updateCell(zones, zone.id, target.id, (c) => ({
        ...c,
        result: "pending_treatment",
        remainingWork: Math.max(0, c.remainingWork - profile.workPerStroke),
        tags: [...new Set([...c.tags, "pending_treatment"])],
      }));
      progressed = true;
      pushEvent(events, {
        kind: "progress",
        zoneId: zone.id,
        toolId: action.toolId,
        cellId: target.id,
        explanation: "Treatment applied. Results show at job review.",
      });
      continue;
    }

    // Scalping: mower on already finished lawn cell
    if (
      action.toolId === "lawn-mower" &&
      zone.kind === "lawn" &&
      (target.result === "finished" || target.remainingWork <= 0)
    ) {
      const scalpKey = `${action.jobId}:${zone.id}:${target.id}:scalped`;
      if (!hasDamageKey(snap, scalpKey)) {
        snap = withDamageKey(snap, scalpKey);
        zones = updateCell(zones, zone.id, target.id, (c) => ({
          ...c,
          result: "scalped",
          damageKinds: [...new Set([...c.damageKinds, "scalped"])],
        }));
        qualityDelta -= 6;
        pushEvent(events, {
          kind: "environment_damaged",
          zoneId: zone.id,
          toolId: action.toolId,
          cellId: target.id,
          qualityDelta: -6,
          costCredits: 10,
          explanation: "Overcutting left a scalped bald patch.",
          damageKey: scalpKey,
        });
      }
      continue;
    }

    // Normal progress
    const nextWork = Math.max(0, target.remainingWork - profile.workPerStroke);
    let result = target.result;
    if (nextWork <= 0) {
      result =
        profile.precision < 0.6 && zone.kind === "edge" ? "uneven" : "finished";
    } else if (nextWork < 100) {
      result = "partial";
    }

    zones = updateCell(zones, zone.id, target.id, (c) => ({
      ...c,
      remainingWork: nextWork,
      result,
    }));
    progressed = true;
    pushEvent(events, {
      kind: "progress",
      zoneId: zone.id,
      toolId: action.toolId,
      cellId: target.id,
      explanation: `${profile.name} made progress on this patch.`,
    });
  }

  if (progressed || events.some((e) => e.kind === "environment_damaged")) {
    tool = applyWear(tool, profile);
  }

  snap = setTool(snap, action.toolId, tool);
  const nextJob = updateJobMetrics({
    ...job,
    zones,
    workActions: job.workActions + 1,
    qualityScore: Math.max(0, job.qualityScore + qualityDelta),
  });
  // recompute quality from zones rather than delta-only
  const refreshed = updateJobMetrics(nextJob);
  snap = {
    ...snap,
    jobs: { ...snap.jobs, [action.jobId]: refreshed },
    lastEvents: events,
  };

  if (!progressed && events.length === 0) {
    pushEvent(events, {
      kind: "ineffective",
      zoneId: zone.id,
      toolId: action.toolId,
      explanation: "No effect.",
    });
  }

  return { nextState: snap, events };
}
