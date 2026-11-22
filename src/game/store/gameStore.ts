"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EQUIPMENT_PROFILES, JOB_BASE_PAYOUT } from "@/data/equipmentProfiles";
import {
  applyClearJam,
  applyRecharge,
  applyRefill,
  applyRepair,
  repairCost,
} from "@/game/rules/durabilityRules";
import {
  canEarlyFinish,
  canFinishComplete,
  computeNetPayout,
  updateJobMetrics,
} from "@/game/rules/qualityRules";
import { createFreshGardenDomain } from "@/game/garden/fixtures";
import { applyEdgeStroke } from "@/game/garden/edgeFixtures";
import { migrateGardenDomain } from "@/game/garden/migrateGarden";
import {
  applyGardenEvent,
  bagDebrisAt,
  gatherNearbyDebris,
} from "@/game/garden/reducer";
import type { GardenEvent } from "@/game/garden/types";
import { guardAndConsumeTool } from "@/game/rules/toolUseGuard";
import { applyWorkAction } from "@/game/work/engine";
import { createFreshV02Snapshot, makeJobState } from "@/game/work/fixtures";
import {
  createFreshV03GardenSnapshot,
  migrateLawnIfNeeded,
} from "@/game/work/gardenFixtures";
import { feesForJob } from "@/game/work/selectors";
import type { WorkAction, WorkEvent, WorkSnapshot } from "@/game/work/types";

/** New garden path. Leaves legacy `yardshift-v02` saves untouched. */
const PERSIST_KEY = "yardshift-v03";

function withGarden(work: WorkSnapshot): WorkSnapshot {
  if (work.garden) {
    return { ...work, garden: migrateGardenDomain(work.garden) };
  }
  return { ...work, garden: createFreshGardenDomain() };
}

interface GameState {
  work: WorkSnapshot;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  startV03Garden: () => void;
  startV02Demo: () => void;
  resetDemo: () => void;
  acceptJob: (jobId: string) => boolean;
  focusZone: (zoneId: string | null) => void;
  setActiveGardenTask: (taskId: string | null) => void;
  selectTool: (toolId: string | null) => void;
  performWorkAction: (action: Omit<WorkAction, "jobId"> & { jobId?: string }) => WorkEvent[];
  rentTool: (toolId: string) => { ok: boolean; reason?: string };
  purchaseTool: (toolId: string) => { ok: boolean; reason?: string };
  repairTool: (toolId: string) => { ok: boolean; reason?: string };
  refillTool: (toolId: string) => { ok: boolean; reason?: string };
  /** Garden-mode free recharge (setup/recovery effort, no credits). */
  rechargeTool: (toolId: string) => { ok: boolean; reason?: string };
  clearJam: (toolId: string) => void;
  finishJob: (early: boolean) => { ok: boolean; reason?: string; net?: number };
  claimReward: (jobId: string) => boolean;
  isJobUnlocked: (jobId: string) => boolean;
  dispatchGarden: (event: GardenEvent) => void;
  inspectObject: (objectId: string) => void;
  removeHazard: (hazardId: string) => void;
  cutHedgeCluster: (clusterId: string, toolId: string, overcut?: boolean) => void;
  pullWeed: (plantId: string) => void;
  topCutWeed: (plantId: string) => void;
  damageFlower: (plantId: string) => void;
  rakeDebris: (x: number, z: number, dx: number, dz: number) => void;
  blowDebris: (x: number, z: number, dirX: number, dirZ: number) => void;
  bagNearbyPiles: (x: number, z: number) => void;
  revisePlan: (orderedTaskIds: string[]) => void;
  setReviewOpen: (open: boolean) => void;
  setFocusPoint: (pt: { x: number; z: number } | null) => void;
  applyEdgeWork: (
    x: number,
    z: number,
    samples: { x: number; z: number }[],
  ) => void;
  finishVisit: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      work: createFreshV03GardenSnapshot(),
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),

      startV03Garden: () => set({ work: createFreshV03GardenSnapshot() }),

      startV02Demo: () => set({ work: createFreshV02Snapshot() }),

      resetDemo: () =>
        set({
          work:
            get().work.schemaVersion === 3
              ? createFreshV03GardenSnapshot()
              : createFreshV02Snapshot(),
        }),

      isJobUnlocked: (jobId) => {
        const { work } = get();
        if (jobId === "job-overgrown-lawn") return true;
        if (jobId === "job-backyard-restoration") {
          return Boolean(work.jobs["job-overgrown-lawn"]?.claimed);
        }
        return false;
      },

      acceptJob: (jobId) => {
        const { work, isJobUnlocked } = get();
        if (!isJobUnlocked(jobId)) return false;
        if (work.jobs[jobId]?.claimed) return false;
        const job = makeJobState(jobId);
        set({
          work: {
            ...work,
            activeJobId: jobId,
            focusedZoneId: null,
            rentedToolIds: [],
            jobs: { ...work.jobs, [jobId]: job },
            lastEvents: [
              {
                id: "accept",
                kind: "progress",
                zoneId: "",
                toolId: "",
                explanation: "Job accepted. Pick a work zone in the yard.",
              },
            ],
          },
        });
        return true;
      },

      focusZone: (zoneId) => {
        set({ work: { ...get().work, focusedZoneId: zoneId } });
      },

      setActiveGardenTask: (taskId) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        set({
          work: {
            ...work,
            focusedZoneId:
              taskId === "lawn"
                ? "j1-lawn"
                : taskId
                  ? `garden-${taskId}`
                  : null,
            garden: { ...work.garden, activeTaskId: taskId },
          },
        });
      },

      selectTool: (toolId) => {
        const work = withGarden(get().work);
        const prev = work.selectedToolId;
        let garden = work.garden;
        if (garden && toolId && toolId !== prev) {
          garden = applyGardenEvent(garden, {
            id: `tool-select:${toolId}:${garden.events.length}`,
            type: "TOOL_SELECTED",
            toolId,
            previousToolId: prev ?? undefined,
            effort: 0.4,
          });
        }
        set({ work: { ...work, selectedToolId: toolId, garden } });
      },

      performWorkAction: (partial) => {
        const { work } = get();
        const jobId = partial.jobId ?? work.activeJobId;
        if (!jobId || !work.selectedToolId) return [];
        const action: WorkAction = {
          jobId,
          zoneId: partial.zoneId,
          toolId: partial.toolId ?? work.selectedToolId,
          action: partial.action,
          worldX: partial.worldX,
          worldZ: partial.worldZ,
          strokeId: partial.strokeId,
          direction: partial.direction,
          sweepSamples: partial.sweepSamples,
          forwardMotion: partial.forwardMotion,
        };
        const profile = EQUIPMENT_PROFILES.find((p) => p.id === action.toolId);
        if (profile) action.action = profile.actionKind;
        const { nextState, events } = applyWorkAction(work, action);

        // Book one-time damage fees from events
        let snap = nextState;
        for (const ev of events) {
          if (ev.kind === "environment_damaged" && ev.costCredits && ev.damageKey) {
            const ledgerId = `damage:${ev.damageKey}`;
            if (!snap.ledger.some((l) => l.id === ledgerId)) {
              snap = {
                ...snap,
                ledger: [
                  ...snap.ledger,
                  {
                    id: ledgerId,
                    kind: "damage",
                    jobId,
                    amount: ev.costCredits,
                    label: ev.explanation,
                  },
                ],
              };
            }
          }
        }
        // Record productive mow effort once into garden domain (no double drain)
        let garden = snap.garden ? migrateGardenDomain(snap.garden) : snap.garden;
        if (garden && events.some((e) => e.kind === "progress")) {
          garden = applyGardenEvent(garden, {
            id: `mow:${action.strokeId ?? events[0]?.id}:${garden.events.length}`,
            type: "WORK_PERFORMED",
            taskId: "lawn",
            toolId: action.toolId,
            affectedIds: [],
            effort: 0.35,
            worldFootprint: {
              x: action.worldX ?? 0,
              z: action.worldZ ?? 0,
              radius: 0.8,
              areaId: "lawn",
            },
          });
        }
        set({ work: { ...snap, garden } });
        return events;
      },

      rentTool: (toolId) => {
        const { work } = get();
        const profile = EQUIPMENT_PROFILES.find((p) => p.id === toolId);
        if (!profile || profile.rentalCredits <= 0) {
          return { ok: false, reason: "Not rentable." };
        }
        if (!work.activeJobId) {
          return { ok: false, reason: "Accept a job first." };
        }
        const ledgerId = `rental:${work.activeJobId}:${toolId}`;
        if (work.ledger.some((l) => l.id === ledgerId)) {
          // already rented this job — ensure in rented list
          if (!work.rentedToolIds.includes(toolId)) {
            set({
              work: {
                ...work,
                rentedToolIds: [...work.rentedToolIds, toolId],
              },
            });
          }
          return { ok: true };
        }
        if (work.ownedToolIds.includes(toolId)) {
          return { ok: false, reason: "Already owned." };
        }
        if (work.balance < profile.rentalCredits) {
          return { ok: false, reason: "Not enough credits to rent." };
        }
        set({
          work: {
            ...work,
            balance: work.balance - profile.rentalCredits,
            rentedToolIds: [...new Set([...work.rentedToolIds, toolId])],
            ledger: [
              ...work.ledger,
              {
                id: ledgerId,
                kind: "rental",
                jobId: work.activeJobId,
                amount: profile.rentalCredits,
                label: `Rental: ${profile.name}`,
              },
            ],
          },
        });
        return { ok: true };
      },

      purchaseTool: (toolId) => {
        const { work } = get();
        const profile = EQUIPMENT_PROFILES.find((p) => p.id === toolId);
        if (!profile || profile.ownedByDefault) {
          return { ok: false, reason: "Cannot purchase." };
        }
        if (work.ownedToolIds.includes(toolId)) {
          return { ok: false, reason: "Already owned." };
        }
        if (work.balance < profile.purchaseCredits) {
          return { ok: false, reason: "Insufficient credits." };
        }
        set({
          work: {
            ...work,
            balance: work.balance - profile.purchaseCredits,
            ownedToolIds: [...work.ownedToolIds, toolId],
          },
        });
        return { ok: true };
      },

      repairTool: (toolId) => {
        const { work } = get();
        const tool = work.tools[toolId];
        if (!tool) return { ok: false, reason: "Unknown tool." };
        const cost = repairCost(tool);
        const ledgerId = `repair:${work.activeJobId ?? "none"}:${toolId}:${tool.condition}:${tool.status}`;
        if (work.ledger.some((l) => l.id === ledgerId)) {
          return { ok: false, reason: "Already repaired this incident." };
        }
        let balance = work.balance;
        let amount = cost;
        if (balance < cost) {
          // deferred capped charge — still repair
          amount = Math.min(cost, 25);
        } else {
          balance -= cost;
        }
        const repaired = applyRepair(tool);
        set({
          work: {
            ...work,
            balance,
            tools: { ...work.tools, [toolId]: repaired },
            ledger: [
              ...work.ledger,
              {
                id: ledgerId,
                kind: "repair",
                jobId: work.activeJobId,
                amount,
                label: `Repair ${toolId}`,
              },
            ],
          },
        });
        return { ok: true };
      },

      refillTool: (toolId) => {
        const { work } = get();
        const tool = work.tools[toolId];
        const profile = EQUIPMENT_PROFILES.find((p) => p.id === toolId);
        if (!tool || !profile) return { ok: false, reason: "Unknown tool." };
        const cost = profile.ownedByDefault ? 0 : 10;
        if (work.balance < cost) return { ok: false, reason: "Need credits." };
        const ledgerId = `refill:${work.activeJobId ?? "x"}:${toolId}:${Date.now()}`;
        // throttle: one refill ledger per tool per job for powered
        const existing = work.ledger.find(
          (l) =>
            l.kind === "refill" &&
            l.jobId === work.activeJobId &&
            l.label.includes(toolId),
        );
        if (existing && !profile.ownedByDefault) {
          // allow refill but no double fee same job — still refill resource
          set({
            work: {
              ...work,
              tools: { ...work.tools, [toolId]: applyRefill(tool) },
            },
          });
          return { ok: true };
        }
        set({
          work: {
            ...work,
            balance: work.balance - cost,
            tools: { ...work.tools, [toolId]: applyRefill(tool) },
            ledger:
              cost > 0
                ? [
                    ...work.ledger,
                    {
                      id: ledgerId,
                      kind: "refill",
                      jobId: work.activeJobId,
                      amount: cost,
                      label: `Refill ${toolId}`,
                    },
                  ]
                : work.ledger,
          },
        });
        return { ok: true };
      },

      clearJam: (toolId) => {
        const { work } = get();
        const tool = work.tools[toolId];
        if (!tool) return;
        set({
          work: {
            ...work,
            tools: { ...work.tools, [toolId]: applyClearJam(tool) },
          },
        });
      },

      rechargeTool: (toolId) => {
        const work = withGarden(get().work);
        const tool = work.tools[toolId];
        if (!tool) return { ok: false, reason: "Unknown tool." };
        const result = applyRecharge(tool);
        if (!result.ok) return { ok: false, reason: result.reason };
        let garden = work.garden;
        if (garden) {
          garden = applyGardenEvent(garden, {
            id: `recharge:${toolId}:${garden.events.length}`,
            type: "TOOL_RECHARGED",
            toolId,
            effort: 1.5,
          });
        }
        set({
          work: {
            ...work,
            tools: { ...work.tools, [toolId]: result.tool },
            garden,
            lastEvents: [
              {
                id: "recharge",
                kind: "refilled",
                zoneId: "",
                toolId,
                explanation:
                  "Battery recharged (prep time). Ready to continue where you left off.",
              },
            ],
          },
        });
        return { ok: true };
      },

      dispatchGarden: (event) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        set({
          work: {
            ...work,
            garden: applyGardenEvent(work.garden, event),
          },
        });
      },

      inspectObject: (objectId) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        let garden = applyGardenEvent(work.garden, {
          id: `inspect:${objectId}`,
          type: "INSPECTED",
          objectId,
          effort: 0.3,
        });
        // Walking the yard reveals quieter spots (edge + hazard hotspots).
        if (objectId === "garden-overview") {
          for (const id of ["hazard", "edge", ...Object.keys(garden.hazards)]) {
            garden = applyGardenEvent(garden, {
              id: `inspect:${id}`,
              type: "INSPECTED",
              objectId: id,
              effort: 0.15,
            });
          }
        }
        set({
          work: {
            ...work,
            garden,
            lastEvents: [
              {
                id: "inspect",
                kind: "progress",
                zoneId: "",
                toolId: "",
                explanation:
                  objectId === "garden-overview"
                    ? "You spotted a stone in the NW lawn and a quieter path edge. Hazards and edges are clearer now."
                    : `Inspected ${objectId}.`,
              },
            ],
          },
        });
      },

      removeHazard: (hazardId) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        const h = work.garden.hazards[hazardId];
        if (!h || h.cleared) return;
        set({
          work: {
            ...work,
            garden: applyGardenEvent(work.garden, {
              id: `hazard-clear:${hazardId}`,
              type: "HAZARD_REMOVED",
              hazardId,
              effort: 1.0,
            }),
            lastEvents: [
              {
                id: "hazard",
                kind: "progress",
                zoneId: "",
                toolId: "",
                explanation: `Removed: ${h.label}. That area is safer to work.`,
              },
            ],
          },
        });
      },

      cutHedgeCluster: (clusterId, toolId, overcut) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        const powered = toolId === "hedge-trimmer";
        const tool = work.tools[toolId];
        if (!tool) return;
        const guard = guardAndConsumeTool(tool, toolId, {
          drain: powered,
          wear: true,
        });
        if (!guard.ok) {
          set({
            work: {
              ...work,
              lastEvents: [
                {
                  id: "tool-block",
                  kind: "not_powered",
                  zoneId: "hedge",
                  toolId,
                  explanation: guard.reason ?? "Tool cannot work.",
                },
              ],
            },
          });
          return;
        }
        // Block powered trimmer near uncleared hardwood hazard
        const blocked = Object.values(work.garden.hazards).some(
          (h) =>
            !h.cleared &&
            h.blocks.includes(toolId) &&
            Math.hypot(
              h.x - (work.garden!.hedgeClusters[clusterId]?.x ?? 99),
              h.z - (work.garden!.hedgeClusters[clusterId]?.z ?? 99),
            ) < 1.2,
        );
        if (blocked) {
          set({
            work: {
              ...work,
              tools: { ...work.tools, [toolId]: guard.tool },
              lastEvents: [
                {
                  id: "blocked",
                  kind: "ineffective",
                  zoneId: "hedge",
                  toolId,
                  explanation:
                    "Hard entangled wood blocks the powered trimmer here — inspect and clear it first.",
                },
              ],
            },
          });
          return;
        }
        const cluster = work.garden.hedgeClusters[clusterId];
        set({
          work: {
            ...work,
            tools: { ...work.tools, [toolId]: guard.tool },
            garden: applyGardenEvent(work.garden, {
              id: `hedge-cut:${clusterId}:${toolId}`,
              type: "HEDGE_CLUSTER_CUT",
              clusterId,
              overcut: Boolean(overcut),
              effort: powered ? 0.35 : 0.55,
              worldFootprint: cluster
                ? { x: cluster.x, z: cluster.z, radius: 1.0, areaId: "hedge" }
                : undefined,
            }),
            lastEvents: [
              {
                id: "hedge",
                kind: "progress",
                zoneId: "hedge",
                toolId,
                explanation: overcut
                  ? "Overcut left a notch in the hedge. Clippings fell below."
                  : "Hedge cluster trimmed. Clippings landed on the ground.",
              },
            ],
          },
        });
      },

      pullWeed: (plantId) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        const p = work.garden.plants[plantId];
        if (!p) return;
        if (p.kind === "flower") {
          get().damageFlower(plantId);
          return;
        }
        set({
          work: {
            ...work,
            garden: applyGardenEvent(work.garden, {
              id: `pull:${plantId}`,
              type: "PLANT_ROOT_REMOVED",
              plantId,
              effort: 0.8,
            }),
            lastEvents: [
              {
                id: "pull",
                kind: "progress",
                zoneId: "flowerbed",
                toolId: "hand-weeder",
                explanation: "Weed pulled by the root. Debris left for cleanup.",
              },
            ],
          },
        });
      },

      topCutWeed: (plantId) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        const p = work.garden.plants[plantId];
        if (!p) return;
        if (p.kind === "flower") {
          get().damageFlower(plantId);
          return;
        }
        set({
          work: {
            ...work,
            garden: applyGardenEvent(work.garden, {
              id: `topcut:${plantId}`,
              type: "PLANT_TOP_CUT",
              plantId,
              effort: 0.3,
            }),
            lastEvents: [
              {
                id: "topcut",
                kind: "stubble",
                zoneId: "flowerbed",
                toolId: "string-trimmer",
                explanation:
                  "Tops cut — roots remain. The weed will need a proper pull later.",
              },
            ],
          },
        });
      },

      damageFlower: (plantId) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        set({
          work: {
            ...work,
            garden: applyGardenEvent(work.garden, {
              id: `flower-dmg:${plantId}`,
              type: "ENVIRONMENT_DAMAGED",
              targetId: plantId,
              damageKind: "ornamental",
            }),
            lastEvents: [
              {
                id: "flower-dmg",
                kind: "environment_damaged",
                zoneId: "flowerbed",
                toolId: work.selectedToolId ?? "",
                explanation: "An ornamental flower was damaged. It stays that way.",
              },
            ],
          },
        });
      },

      rakeDebris: (x, z, dx, dz) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        let garden = gatherNearbyDebris(
          work.garden,
          x + dx * 0.4,
          z + dz * 0.4,
          1.1,
          `rake:${work.garden.events.length}`,
        );
        // Also nudge nearby scattered leaves along rake direction
        for (const d of Object.values(garden.debris)) {
          if (d.state !== "scattered") continue;
          if ((d.x - x) ** 2 + (d.z - z) ** 2 > 1.4 * 1.4) continue;
          garden = applyGardenEvent(garden, {
            id: `rake-nudge:${d.id}:${garden.events.length}`,
            type: "DEBRIS_MOVED",
            debrisId: d.id,
            x: d.x + dx * 0.5,
            z: d.z + dz * 0.5,
          });
        }
        set({
          work: {
            ...work,
            garden,
            lastEvents: [
              {
                id: "rake",
                kind: "progress",
                zoneId: "debris",
                toolId: "rake",
                explanation: "Raked leaves along the path.",
              },
            ],
          },
        });
      },

      blowDebris: (x, z, dirX, dirZ) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        const tool = work.tools["leaf-blower"];
        if (!tool) return;
        const guard = guardAndConsumeTool(tool, "leaf-blower", {
          drain: true,
          wear: true,
        });
        if (!guard.ok) {
          set({
            work: {
              ...work,
              lastEvents: [
                {
                  id: "blow-block",
                  kind: "not_powered",
                  zoneId: "debris",
                  toolId: "leaf-blower",
                  explanation: guard.reason ?? "Blower cannot run.",
                },
              ],
            },
          });
          return;
        }
        const len = Math.hypot(dirX, dirZ) || 1;
        const nx = dirX / len;
        const nz = dirZ / len;
        let garden = work.garden;
        let moved = 0;
        for (const d of Object.values(garden.debris)) {
          if (d.state === "bagged") continue;
          const dist2 = (d.x - x) ** 2 + (d.z - z) ** 2;
          if (dist2 > 2.2 * 2.2) continue;
          const toDx = d.x - x;
          const toDz = d.z - z;
          const toLen = Math.hypot(toDx, toDz) || 1;
          const dot = (toDx / toLen) * nx + (toDz / toLen) * nz;
          if (dot < 0.15 && dist2 > 0.4) continue;
          const push = d.state === "gathered" ? 1.4 : 0.9;
          garden = applyGardenEvent(garden, {
            id: `blow:${d.id}:${garden.events.length}`,
            type: "DEBRIS_MOVED",
            debrisId: d.id,
            x: d.x + nx * push,
            z: d.z + nz * push,
            worldFootprint: { x, z, radius: 2.2, areaId: "debris" },
          });
          moved++;
          if (d.state === "gathered") {
            garden = {
              ...garden,
              debris: {
                ...garden.debris,
                [d.id]: { ...garden.debris[d.id], state: "scattered" },
              },
              effort: {
                ...garden.effort,
                ineffective: garden.effort.ineffective + 0.3,
              },
            };
          }
        }
        set({
          work: {
            ...work,
            tools: { ...work.tools, "leaf-blower": guard.tool },
            garden,
            lastEvents: [
              {
                id: "blow",
                kind: moved ? "progress" : "ineffective",
                zoneId: "debris",
                toolId: "leaf-blower",
                explanation: moved
                  ? "Blower moved debris in the aim direction."
                  : "Nothing in the blower cone.",
              },
            ],
          },
        });
      },

      bagNearbyPiles: (x, z) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        const { domain, bagged } = bagDebrisAt(
          work.garden,
          x,
          z,
          1.3,
          `bag:${work.garden.events.length}`,
        );
        if (bagged.length === 0) {
          set({
            work: {
              ...work,
              lastEvents: [
                {
                  id: "bag-miss",
                  kind: "ineffective",
                  zoneId: "debris",
                  toolId: "bag",
                  explanation: "No gathered pile nearby to bag.",
                },
              ],
            },
          });
          return;
        }
        set({
          work: {
            ...work,
            garden: domain,
            lastEvents: [
              {
                id: "bag",
                kind: "bagged",
                zoneId: "debris",
                toolId: "bag",
                explanation: `Bagged ${bagged.length} gathered pile(s).`,
              },
            ],
          },
        });
      },

      revisePlan: (orderedTaskIds) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        set({
          work: {
            ...work,
            garden: applyGardenEvent(work.garden, {
              id: `plan:${work.garden.plan.revision + 1}`,
              type: "PLAN_REVISED",
              orderedTaskIds,
            }),
          },
        });
      },

      setReviewOpen: (open) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        set({
          work: {
            ...work,
            garden: { ...work.garden, reviewOpen: open },
          },
        });
      },

      setFocusPoint: (pt) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        set({
          work: {
            ...work,
            garden: { ...work.garden, focusPoint: pt },
          },
        });
      },

      applyEdgeWork: (x, z, samples) => {
        const work = withGarden(get().work);
        if (!work.garden || !work.selectedToolId) return;
        const toolId = work.selectedToolId;
        if (toolId !== "hand-edger" && toolId !== "string-trimmer") {
          set({
            work: {
              ...work,
              lastEvents: [
                {
                  id: "edge-tool",
                  kind: "ineffective",
                  zoneId: "edge",
                  toolId,
                  explanation: "Use a hand edger or string trimmer on the path edge.",
                },
              ],
            },
          });
          return;
        }
        const tool = work.tools[toolId];
        if (!tool) return;
        const powered = toolId === "string-trimmer";
        const guard = guardAndConsumeTool(tool, toolId, {
          drain: powered,
          wear: true,
        });
        if (!guard.ok) {
          set({
            work: {
              ...work,
              lastEvents: [
                {
                  id: "edge-block",
                  kind: "not_powered",
                  zoneId: "edge",
                  toolId,
                  explanation: guard.reason ?? "Tool cannot work.",
                },
              ],
            },
          });
          return;
        }
        const radius = powered ? 0.55 : 0.35;
        const workPer = powered ? 28 : 22;
        let segments = work.garden.edgeSegments ?? {};
        const hit = new Set<string>();
        const pts = samples.length ? samples : [{ x, z }];
        for (const p of pts) {
          if (p.z > -2.6 || p.z < -4.3) continue;
          const res = applyEdgeStroke(segments, p.x, p.z, radius, workPer);
          segments = res.segments;
          res.hitIds.forEach((id) => hit.add(id));
        }
        if (hit.size === 0) {
          set({
            work: {
              ...work,
              tools: { ...work.tools, [toolId]: guard.tool },
              lastEvents: [
                {
                  id: "edge-miss",
                  kind: "ineffective",
                  zoneId: "edge",
                  toolId,
                  explanation: "Stay on the path–lawn edge strip.",
                },
              ],
            },
          });
          return;
        }
        let garden = {
          ...work.garden,
          edgeSegments: segments,
        };
        garden = applyGardenEvent(garden, {
          id: `edge:${toolId}:${garden.events.length}`,
          type: "EDGE_WORKED",
          segmentIds: [...hit],
          toolId,
          effort: powered ? 0.25 : 0.4,
          worldFootprint: { x, z, radius, areaId: "edge" },
        });
        set({
          work: {
            ...work,
            tools: { ...work.tools, [toolId]: guard.tool },
            garden,
            lastEvents: [
              {
                id: "edge",
                kind: "progress",
                zoneId: "edge",
                toolId,
                explanation: "Path edge neatened — separate from the open lawn cut.",
              },
            ],
          },
        });
      },

      finishVisit: () => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        set({
          work: {
            ...work,
            garden: applyGardenEvent(work.garden, {
              id: `visit-finish:${work.garden.events.length}`,
              type: "VISIT_FINISHED",
              summaryNote: "Visit finished — compare effort and unfinished work.",
            }),
          },
        });
      },

      finishJob: (early) => {
        const { work } = get();
        const jobId = work.activeJobId;
        if (!jobId) return { ok: false, reason: "No active job." };
        let job = updateJobMetrics(work.jobs[jobId]);
        if (early) {
          if (!canEarlyFinish(job)) {
            return {
              ok: false,
              reason: "Need at least 70% essential work to finish early.",
            };
          }
          job = { ...job, earlyFinish: true };
        } else if (!canFinishComplete(job) && !canEarlyFinish(job)) {
          return { ok: false, reason: "Work incomplete." };
        }
        const fees = feesForJob(work, jobId);
        const net = computeNetPayout(job, fees);
        const payoutId = `payout:${jobId}`;
        if (work.ledger.some((l) => l.id === payoutId) || job.claimed) {
          return { ok: false, reason: "Already settled." };
        }
        job = {
          ...job,
          settled: true,
          claimed: true,
          netCredits: net,
        };
        set({
          work: {
            ...work,
            balance: work.balance + net,
            activeJobId: null,
            focusedZoneId: null,
            rentedToolIds: [],
            jobs: { ...work.jobs, [jobId]: job },
            ledger: [
              ...work.ledger,
              {
                id: payoutId,
                kind: "payout",
                jobId,
                amount: -net,
                label: `Payout ${jobId} (base ${JOB_BASE_PAYOUT[jobId]})`,
              },
            ],
            lastEvents: [
              {
                id: "settle",
                kind: "progress",
                zoneId: "",
                toolId: "",
                explanation: `Job settled for ${net} credits (quality ${Math.round(job.qualityScore)}).`,
              },
            ],
          },
        });
        return { ok: true, net };
      },

      claimReward: (jobId) => {
        // v0.2 settles on finishJob; claim is alias if already finished but not claimed
        const { work, finishJob } = get();
        const job = work.jobs[jobId];
        if (!job) return false;
        if (job.claimed) return false;
        if (work.activeJobId === jobId) {
          const res = finishJob(canFinishComplete(job) ? false : true);
          return Boolean(res.ok);
        }
        return false;
      },
    }),
    {
      name: PERSIST_KEY,
      version: 3,
      partialize: (state) => ({ work: state.work }),
      migrate: (persisted) => {
        const p = persisted as { work?: import("@/game/work/types").WorkSnapshot };
        if (p?.work) {
          let work = migrateLawnIfNeeded(p.work);
          if (work.schemaVersion === 3) {
            work = {
              ...work,
              garden: work.garden
                ? migrateGardenDomain(work.garden)
                : createFreshGardenDomain(),
            };
          }
          return { ...p, work };
        }
        return persisted as never;
      },
      onRehydrateStorage: () => (state) => {
        if (state?.work) {
          let work = migrateLawnIfNeeded(state.work);
          if (work.schemaVersion === 3) {
            work = {
              ...work,
              garden: work.garden
                ? migrateGardenDomain(work.garden)
                : createFreshGardenDomain(),
            };
          }
          state.work = work;
        }
        state?.setHydrated(true);
      },
    },
  ),
);

declare global {
  interface Window {
    __yardshift?: typeof useGameStore;
  }
}

if (typeof window !== "undefined") {
  window.__yardshift = useGameStore;
}
