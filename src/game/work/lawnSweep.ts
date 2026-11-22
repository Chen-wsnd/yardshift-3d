import { getProfile } from "@/data/equipmentProfiles";
import { LAWN_FINE, inLawnBounds } from "@/data/lawnGrid";
import {
  applyWear,
  isToolUsable,
  markUnpoweredIfEmpty,
} from "@/game/rules/durabilityRules";
import { updateJobMetrics } from "@/game/rules/qualityRules";
import type {
  SweepSample,
  ToolInstance,
  WorkAction,
  WorkCell,
  WorkEvent,
  WorkSnapshot,
  WorkZone,
} from "./types";

function pushEvent(
  events: WorkEvent[],
  e: Omit<WorkEvent, "id"> & { id?: string },
) {
  events.push({ id: e.id ?? `evt-${events.length}-${e.kind}`, ...e });
}

function hasDamageKey(snap: WorkSnapshot, key: string) {
  return snap.damageKeys.includes(key);
}

function withDamageKey(snap: WorkSnapshot, key: string): WorkSnapshot {
  if (snap.damageKeys.includes(key)) return snap;
  return { ...snap, damageKeys: [...snap.damageKeys, key] };
}

function cellIndex(zone: WorkZone): Map<string, number> {
  const m = new Map<string, number>();
  zone.cells.forEach((c, i) => m.set(c.id, i));
  return m;
}

function cellsUnderSample(
  zone: WorkZone,
  x: number,
  z: number,
  radius: number,
): WorkCell[] {
  if (!inLawnBounds(x, z)) return [];
  const r2 = radius * radius;
  const out: WorkCell[] = [];
  for (const c of zone.cells) {
    if (c.isPile) continue;
    const dx = c.localX - x;
    const dz = c.localZ - z;
    if (dx * dx + dz * dz <= r2) out.push(c);
  }
  return out;
}

function pathLength(samples: SweepSample[]): number {
  let len = 0;
  for (let i = 1; i < samples.length; i++) {
    len += Math.hypot(
      samples[i].x - samples[i - 1].x,
      samples[i].z - samples[i - 1].z,
    );
  }
  return len;
}

/**
 * Batch lawn sweep — one authoritative update for a drag path segment.
 * Does not clone the full snapshot more than once (caller provides clone).
 */
export function applyLawnSweep(
  snap: WorkSnapshot,
  action: WorkAction,
): { nextState: WorkSnapshot; events: WorkEvent[] } {
  const events: WorkEvent[] = [];
  const samples = action.sweepSamples ?? [];
  if (samples.length === 0) {
    pushEvent(events, {
      kind: "ineffective",
      zoneId: action.zoneId,
      toolId: action.toolId,
      explanation: "No path samples.",
    });
    return { nextState: snap, events };
  }

  const job = snap.jobs[action.jobId];
  const zone = job?.zones.find((z) => z.id === action.zoneId);
  const profile = getProfile(action.toolId);
  let tool = snap.tools[action.toolId];
  if (!job || !zone || !profile || !tool) {
    pushEvent(events, {
      kind: "ineffective",
      zoneId: action.zoneId,
      toolId: action.toolId,
      explanation: "Invalid lawn sweep context.",
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
      explanation: "Tool not available.",
    });
    return { nextState: snap, events };
  }

  tool = markUnpoweredIfEmpty(tool);
  const usable = isToolUsable(tool);
  if (!usable.ok) {
    pushEvent(events, {
      kind:
        tool.status === "unpowered" || tool.resource <= 0
          ? "not_powered"
          : tool.status === "jammed"
            ? "jammed"
            : "broken",
      zoneId: action.zoneId,
      toolId: action.toolId,
      explanation: usable.reason ?? "Tool cannot work.",
    });
    return {
      nextState: {
        ...snap,
        tools: { ...snap.tools, [action.toolId]: tool },
        lastEvents: events,
      },
      events,
    };
  }

  const isReel = action.toolId === "manual-reel-mower";
  const isPowered = action.toolId === "lawn-mower";

  // Safety: uncleared lawn hazard blocks mowing in its radius
  if (snap.garden) {
    const blocking = Object.values(snap.garden.hazards).find(
      (h) =>
        !h.cleared &&
        h.blocks.includes(action.toolId) &&
        samples.some(
          (s) => (s.x - h.x) ** 2 + (s.z - h.z) ** 2 <= 1.1 * 1.1,
        ),
    );
    if (blocking) {
      pushEvent(events, {
        kind: "ineffective",
        zoneId: zone.id,
        toolId: action.toolId,
        explanation: `${blocking.label} — clear it before mowing this patch.`,
      });
      return { nextState: { ...snap, lastEvents: events }, events };
    }
  }

  // Half-width of cut + small slop so footprint reaches adjacent fine cells
  const cutRadius =
    (isReel ? LAWN_FINE.reelCutWidth : LAWN_FINE.poweredCutWidth) * 0.5 + 0.08;
  const forward = action.forwardMotion !== false;
  // Reel reverse: almost no cut; powered still cuts while moving
  const efficiency = isReel && !forward ? 0.12 : 1;

  const cells = zone.cells.map((c) => ({ ...c }));
  const index = cellIndex({ ...zone, cells });
  let qualityDelta = 0;
  let anyProgress = false;
  const touched = new Set<string>();

  for (const sample of samples) {
    if (!inLawnBounds(sample.x, sample.z)) continue;
    const hits = cellsUnderSample({ ...zone, cells }, sample.x, sample.z, cutRadius);
    for (const hit of hits) {
      const i = index.get(hit.id);
      if (i == null) continue;
      const cell = cells[i];

      // Flower damage — once only, powered/imprecise tools
      if (
        cell.protectedKind === "flower" &&
        profile.precision < 0.7 &&
        !hasDamageKey(
          snap,
          `${action.jobId}:${zone.id}:${cell.id}:flower_damaged`,
        )
      ) {
        const dmgKey = `${action.jobId}:${zone.id}:${cell.id}:flower_damaged`;
        snap = withDamageKey(snap, dmgKey);
        cells[i] = {
          ...cell,
          result: "flower_damaged",
          damageKinds: [...new Set([...cell.damageKinds, "flower_damaged"])],
        };
        qualityDelta -= 8;
        pushEvent(events, {
          kind: "environment_damaged",
          zoneId: zone.id,
          toolId: action.toolId,
          cellId: cell.id,
          qualityDelta: -8,
          costCredits: 0,
          explanation:
            "The mower clipped the flower border. The damage stays on this lawn.",
          damageKey: dmgKey,
        });
        continue;
      }

      if (cell.protectedKind === "flower" && profile.precision >= 0.7) {
        // Careful reel near flowers — skip cutting the flower cell itself
        continue;
      }

      // Already fully cut — revisiting does not damage grass
      if (cell.remainingWork <= 0 && cell.result !== "flower_damaged") {
        continue;
      }

      const work = Math.max(
        8,
        profile.workPerStroke * efficiency * 0.55,
      );
      const nextWork = Math.max(0, cell.remainingWork - work);
      const result =
        nextWork <= 0 ? ("finished" as const) : ("partial" as const);

      cells[i] = {
        ...cell,
        remainingWork: nextWork,
        result,
      };
      touched.add(cell.id);
      anyProgress = true;
    }
  }

  // Resource / wear once per sweep batch
  const metres = Math.max(pathLength(samples), 0.01);
  if (isPowered && tool.resourceType === "battery") {
    const drain = Math.min(tool.resource, metres * 4.5);
    tool = {
      ...tool,
      resource: Math.max(0, tool.resource - drain),
    };
    tool = markUnpoweredIfEmpty(tool);
  }
  if (anyProgress || metres > 0.05) {
    // Condition wear only — battery already drained by path metres above.
    tool = applyWear(
      tool,
      {
        ...profile,
        wearPerStroke: profile.wearPerStroke * Math.min(1.5, metres),
      },
      false,
      { drainResource: false },
    );
  }

  if (!anyProgress && events.length === 0) {
    pushEvent(events, {
      kind: "ineffective",
      zoneId: zone.id,
      toolId: action.toolId,
      explanation: isReel && !forward
        ? "Reel mowers barely cut in reverse — push forward."
        : "No uncut grass under that pass.",
    });
  } else if (anyProgress) {
    pushEvent(events, {
      kind: "progress",
      zoneId: zone.id,
      toolId: action.toolId,
      explanation: isPowered
        ? "Powered pass cut a wider strip."
        : forward
          ? "Reel pass left a narrow cut strip."
          : "Reverse reel pass did almost nothing.",
      qualityDelta,
    });
  }

  const nextZones = job.zones.map((z) =>
    z.id === zone.id ? { ...z, cells } : z,
  );
  const nextJob = updateJobMetrics({
    ...job,
    zones: nextZones,
    workActions: job.workActions + (anyProgress ? 1 : 0),
    qualityScore: Math.max(0, job.qualityScore + qualityDelta),
  });

  return {
    nextState: {
      ...snap,
      tools: { ...snap.tools, [action.toolId]: tool as ToolInstance },
      jobs: { ...snap.jobs, [action.jobId]: nextJob },
      lastEvents: events,
    },
    events,
  };
}

/** Clamp a raw pointer target so one frame cannot teleport across the lawn. */
export function clampPointerStep(
  from: SweepSample,
  to: SweepSample,
  maxStep = LAWN_FINE.maxStepPerSample,
): SweepSample {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const dist = Math.hypot(dx, dz);
  if (dist <= maxStep || dist < 1e-6) return to;
  const s = maxStep / dist;
  return { x: from.x + dx * s, z: from.z + dz * s };
}

/** Interpolate a segment so sample spacing ≤ ~half cut width. */
export function interpolateSamples(
  from: SweepSample,
  to: SweepSample,
  cutWidth: number,
): SweepSample[] {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const dist = Math.hypot(dx, dz);
  if (dist < 1e-6) return [];
  const spacing = Math.max(0.08, cutWidth * LAWN_FINE.sampleSpacingFactor);
  const steps = Math.max(1, Math.ceil(dist / spacing));
  const out: SweepSample[] = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    out.push({ x: from.x + dx * t, z: from.z + dz * t });
  }
  return out;
}
