import { footprintsOverlap } from "@/game/rules/toolUseGuard";
import type { CleanupRecord, GardenDomain, WorldFootprint } from "./types";

/** Was this footprint previously cleaned, then later re-dirtied by a spawn? */
export function isReworkCleanup(
  domain: GardenDomain,
  footprint: WorldFootprint,
): boolean {
  const history = domain.cleanupHistory ?? [];
  if (history.length === 0) return false;

  const overlapping = history.filter((h) =>
    footprintsOverlap(h, footprint),
  );
  if (overlapping.length === 0) return false;

  // Any clipping spawn after the earliest overlapping clean, inside footprint?
  const earliest = Math.min(...overlapping.map((h) => h.atEventIndex));
  for (let i = earliest + 1; i < domain.events.length; i++) {
    const ev = domain.events[i];
    if (ev.type !== "DEBRIS_SPAWNED") continue;
    if (ev.kind !== "clipping" && ev.kind !== "pulled_weed") continue;
    const d = Math.hypot(ev.x - footprint.x, ev.z - footprint.z);
    if (d <= footprint.radius + 0.6) return true;
  }
  return false;
}

export function appendCleanupRecord(
  domain: GardenDomain,
  footprint: WorldFootprint,
  debrisIds: string[],
  eventId: string,
): GardenDomain {
  const record: CleanupRecord = {
    id: `cleanup:${eventId}`,
    x: footprint.x,
    z: footprint.z,
    radius: footprint.radius,
    atEventIndex: domain.events.length,
    debrisIds,
  };
  return {
    ...domain,
    cleanupHistory: [...(domain.cleanupHistory ?? []), record],
  };
}

/** Potential revisit note — spawn after prior clean in same area (not yet rework effort). */
export function countPotentialRedirty(domain: GardenDomain): {
  count: number;
  notes: string[];
  /** Event IDs of clippings that actually landed on previously cleaned ground (P1-05). */
  spawnEventIds: string[];
} {
  const notes: string[] = [];
  const spawnEventIds: string[] = [];
  let count = 0;
  const history = domain.cleanupHistory ?? [];
  for (const ev of domain.events) {
    if (ev.type !== "DEBRIS_SPAWNED") continue;
    if (ev.kind !== "clipping") continue;
    const idx = domain.events.findIndex((e) => e.id === ev.id);
    const prior = history.some(
      (h) =>
        h.atEventIndex < idx &&
        footprintsOverlap(h, { x: ev.x, z: ev.z, radius: 1.2 }),
    );
    if (prior) {
      count++;
      spawnEventIds.push(ev.id);
      notes.push(
        `New clippings at (${ev.x.toFixed(1)}, ${ev.z.toFixed(1)}) landed where you had already cleaned.`,
      );
    }
  }
  return { count, notes, spawnEventIds };
}
