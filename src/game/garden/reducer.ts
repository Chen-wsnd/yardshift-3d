import { appendCleanupRecord, isReworkCleanup } from "./spatialRework";
import type {
  DebrisEntity,
  EffortLedger,
  GardenDomain,
  GardenEvent,
  WorldFootprint,
} from "./types";

function pushUnique(
  domain: GardenDomain,
  event: GardenEvent,
): GardenDomain {
  if (domain.appliedEventIds.includes(event.id)) return domain;
  return {
    ...domain,
    events: [...domain.events, event],
    appliedEventIds: [...domain.appliedEventIds, event.id],
  };
}

function addEffort(
  effort: EffortLedger,
  kind: keyof EffortLedger,
  amount: number,
): EffortLedger {
  return { ...effort, [kind]: effort[kind] + amount };
}

/** Apply a garden domain event idempotently. */
export function applyGardenEvent(
  domain: GardenDomain,
  event: GardenEvent,
): GardenDomain {
  if (domain.appliedEventIds.includes(event.id)) return domain;
  let next = pushUnique(domain, event);

  switch (event.type) {
    case "INSPECTED": {
      next = {
        ...next,
        inspection: {
          ...next.inspection,
          [event.objectId]: { observed: true, effort: event.effort },
        },
        effort: addEffort(next.effort, "setup", event.effort),
      };
      break;
    }
    case "HAZARD_REMOVED": {
      const h = next.hazards[event.hazardId];
      if (h) {
        next = {
          ...next,
          hazards: {
            ...next.hazards,
            [event.hazardId]: { ...h, cleared: true },
          },
          effort: addEffort(next.effort, "setup", event.effort),
        };
      }
      break;
    }
    case "TOOL_SELECTED": {
      next = {
        ...next,
        effort: addEffort(next.effort, "setup", event.effort),
      };
      break;
    }
    case "TOOL_RECHARGED": {
      next = {
        ...next,
        effort: addEffort(next.effort, "recovery", event.effort),
      };
      break;
    }
    case "PLAN_REVISED": {
      next = {
        ...next,
        plan: {
          taskOrder: event.orderedTaskIds,
          revision: next.plan.revision + 1,
        },
      };
      break;
    }
    case "WORK_PERFORMED": {
      next = {
        ...next,
        effort: addEffort(next.effort, "productive", event.effort),
      };
      break;
    }
    case "EDGE_WORKED": {
      next = {
        ...next,
        effort: addEffort(next.effort, "productive", event.effort),
      };
      break;
    }
    case "HEDGE_CLUSTER_CUT": {
      const c = next.hedgeClusters[event.clusterId];
      if (c && !c.cut) {
        const debrisId = `debris-hedge-${event.clusterId}`;
        const debris: DebrisEntity = {
          id: debrisId,
          kind: "clipping",
          x: c.x,
          z: c.z + 0.35,
          state: "scattered",
          sourceActionId: event.id,
        };
        const debrisMap = next.debris[debrisId]
          ? next.debris
          : { ...next.debris, [debrisId]: debris };
        next = {
          ...next,
          hedgeClusters: {
            ...next.hedgeClusters,
            [event.clusterId]: {
              ...c,
              cut: true,
              overcut: Boolean(event.overcut) || c.overcut,
            },
          },
          debris: debrisMap,
          effort: addEffort(next.effort, "productive", event.effort),
        };
        if (!next.appliedEventIds.includes(`spawn:${debrisId}`)) {
          next = {
            ...next,
            appliedEventIds: [...next.appliedEventIds, `spawn:${debrisId}`],
            events: [
              ...next.events,
              {
                id: `spawn:${debrisId}`,
                type: "DEBRIS_SPAWNED",
                debrisId,
                sourceActionId: event.id,
                x: debris.x,
                z: debris.z,
                kind: "clipping",
              },
            ],
          };
        }
      } else if (c?.cut && event.overcut) {
        next = {
          ...next,
          hedgeClusters: {
            ...next.hedgeClusters,
            [event.clusterId]: { ...c, overcut: true },
          },
          effort: addEffort(next.effort, "ineffective", 0.2),
        };
      }
      break;
    }
    case "PLANT_ROOT_REMOVED": {
      const p = next.plants[event.plantId];
      if (p && !p.rootRemoved) {
        const debrisId = `debris-weed-${event.plantId}`;
        next = {
          ...next,
          plants: {
            ...next.plants,
            [event.plantId]: { ...p, rootRemoved: true, topCut: true },
          },
          debris: {
            ...next.debris,
            [debrisId]: {
              id: debrisId,
              kind: "pulled_weed",
              x: p.x,
              z: p.z,
              state: "scattered",
              sourceActionId: event.id,
            },
          },
          effort: addEffort(next.effort, "productive", event.effort),
        };
      }
      break;
    }
    case "PLANT_TOP_CUT": {
      const p = next.plants[event.plantId];
      if (p && !p.rootRemoved) {
        next = {
          ...next,
          plants: {
            ...next.plants,
            [event.plantId]: { ...p, topCut: true },
          },
          effort: addEffort(next.effort, "productive", event.effort * 0.5),
        };
      }
      break;
    }
    case "DEBRIS_SPAWNED": {
      if (!next.debris[event.debrisId]) {
        next = {
          ...next,
          debris: {
            ...next.debris,
            [event.debrisId]: {
              id: event.debrisId,
              kind: event.kind,
              x: event.x,
              z: event.z,
              state: "scattered",
              sourceActionId: event.sourceActionId,
            },
          },
        };
      }
      break;
    }
    case "DEBRIS_MOVED": {
      const d = next.debris[event.debrisId];
      if (d && d.state !== "bagged") {
        next = {
          ...next,
          debris: {
            ...next.debris,
            [event.debrisId]: {
              ...d,
              x: event.x,
              z: event.z,
              state: "scattered",
            },
          },
        };
      }
      break;
    }
    case "DEBRIS_GATHERED": {
      const debris = { ...next.debris };
      for (const id of event.debrisIds) {
        if (debris[id] && debris[id].state !== "bagged") {
          debris[id] = { ...debris[id], state: "gathered" };
        }
      }
      const effortAmt = event.effort ?? 0.5;
      const kind = event.isRework ? "rework" : "productive";
      next = {
        ...next,
        debris,
        effort: addEffort(next.effort, kind, effortAmt),
      };
      break;
    }
    case "DEBRIS_BAGGED": {
      const debris = { ...next.debris };
      let count = 0;
      for (const id of event.debrisIds) {
        if (debris[id] && debris[id].state === "gathered") {
          debris[id] = { ...debris[id], state: "bagged" };
          count++;
        }
      }
      const effortAmt = event.effort ?? count * 0.4;
      const kind = event.isRework ? "rework" : "productive";
      next = {
        ...next,
        debris,
        effort: addEffort(next.effort, kind, effortAmt),
      };
      break;
    }
    case "ENVIRONMENT_DAMAGED": {
      const p = next.plants[event.targetId];
      if (p && !p.ornamentalDamage) {
        next = {
          ...next,
          plants: {
            ...next.plants,
            [event.targetId]: { ...p, ornamentalDamage: true },
          },
        };
      }
      break;
    }
    case "VISIT_FINISHED": {
      next = {
        ...next,
        visitFinished: true,
        lastVisitNote: event.summaryNote ?? next.lastVisitNote,
        reviewOpen: true,
      };
      break;
    }
    default:
      break;
  }
  return next;
}

export function moveDebrisToward(
  domain: GardenDomain,
  debrisId: string,
  dx: number,
  dz: number,
  eventId: string,
): GardenDomain {
  const d = domain.debris[debrisId];
  if (!d || d.state === "bagged") return domain;
  return applyGardenEvent(domain, {
    id: eventId,
    type: "DEBRIS_MOVED",
    debrisId,
    x: d.x + dx,
    z: d.z + dz,
  });
}

/** Cluster nearby scattered debris; marks rework only if same prior cleanup footprint. */
export function gatherNearbyDebris(
  domain: GardenDomain,
  originX: number,
  originZ: number,
  radius: number,
  eventId: string,
): GardenDomain {
  const ids = Object.values(domain.debris)
    .filter(
      (d) =>
        d.state === "scattered" &&
        (d.x - originX) ** 2 + (d.z - originZ) ** 2 <= radius * radius,
    )
    .map((d) => d.id);
  if (ids.length === 0) return domain;

  const footprint: WorldFootprint = {
    x: originX,
    z: originZ,
    radius,
    areaId: "debris",
  };
  const rework = isReworkCleanup(domain, footprint);

  let next = domain;
  for (const id of ids) {
    const d = next.debris[id];
    if (!d) continue;
    const nx = d.x * 0.35 + originX * 0.65;
    const nz = d.z * 0.35 + originZ * 0.65;
    next = applyGardenEvent(next, {
      id: `${eventId}:move:${id}`,
      type: "DEBRIS_MOVED",
      debrisId: id,
      x: nx,
      z: nz,
      worldFootprint: footprint,
    });
  }
  next = applyGardenEvent(next, {
    id: `${eventId}:gather`,
    type: "DEBRIS_GATHERED",
    debrisIds: ids,
    worldFootprint: footprint,
    effort: 0.5,
    isRework: rework,
  });
  return appendCleanupRecord(next, footprint, ids, eventId);
}

export function bagDebrisAt(
  domain: GardenDomain,
  originX: number,
  originZ: number,
  radius: number,
  eventId: string,
): { domain: GardenDomain; bagged: string[] } {
  const ids = Object.values(domain.debris)
    .filter(
      (d) =>
        d.state === "gathered" &&
        (d.x - originX) ** 2 + (d.z - originZ) ** 2 <= radius * radius,
    )
    .map((d) => d.id);
  if (ids.length === 0) return { domain, bagged: [] };

  const footprint: WorldFootprint = {
    x: originX,
    z: originZ,
    radius,
    areaId: "debris",
  };
  const rework = isReworkCleanup(domain, footprint);
  let next = applyGardenEvent(domain, {
    id: eventId,
    type: "DEBRIS_BAGGED",
    debrisIds: ids,
    worldFootprint: footprint,
    effort: ids.length * 0.4,
    isRework: rework,
  });
  next = appendCleanupRecord(next, footprint, ids, eventId);
  return { domain: next, bagged: ids };
}
