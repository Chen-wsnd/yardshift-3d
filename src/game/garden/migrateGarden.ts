import { createEdgeSegments } from "./edgeFixtures";
import type { GardenDomain } from "./types";

/** Ensure older nested garden domains gain edge + cleanup fields. */
export function migrateGardenDomain(garden: GardenDomain): GardenDomain {
  const edgeSegments =
    garden.edgeSegments && Object.keys(garden.edgeSegments).length > 0
      ? garden.edgeSegments
      : createEdgeSegments();
  return {
    ...garden,
    schemaVersion: 2,
    edgeSegments,
    cleanupHistory: garden.cleanupHistory ?? [],
    focusPoint: garden.focusPoint ?? null,
    visitFinished: garden.visitFinished ?? false,
    lastVisitNote: garden.lastVisitNote ?? null,
  };
}
