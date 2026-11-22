import { createEdgeSegments } from "./edgeFixtures";
import type { GardenDomain, PlantEntity } from "./types";

function migratePlants(
  plants: Record<string, PlantEntity>,
): Record<string, PlantEntity> {
  const out: Record<string, PlantEntity> = {};
  for (const [id, p] of Object.entries(plants ?? {})) {
    out[id] = {
      ...p,
      countsTowardCompletion: p.countsTowardCompletion ?? true,
    };
  }
  return out;
}

/** Ensure older nested garden domains gain edge, cleanup, and visitHistory. */
export function migrateGardenDomain(garden: GardenDomain): GardenDomain {
  const edgeSegments =
    garden.edgeSegments && Object.keys(garden.edgeSegments).length > 0
      ? garden.edgeSegments
      : createEdgeSegments();
  return {
    ...garden,
    schemaVersion: 3,
    edgeSegments,
    cleanupHistory: garden.cleanupHistory ?? [],
    focusPoint: garden.focusPoint ?? null,
    visitFinished: garden.visitFinished ?? false,
    lastVisitNote: garden.lastVisitNote ?? null,
    visitHistory: garden.visitHistory ?? [],
    plants: migratePlants(garden.plants ?? {}),
  };
}
