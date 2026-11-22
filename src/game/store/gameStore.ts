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
import { buildVisitSummary } from "@/game/learning/visitSummary";
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

/** After Finish, world mutations are frozen until Try again (G04 / Q28). */
function sealedBlock(work: WorkSnapshot): WorkSnapshot | null {
  if (!work.garden?.visitFinished) return null;
  return {
    ...work,
    lastEvents: [
      {
        id: "visit-sealed",
        kind: "ineffective",
        zoneId: "",
        toolId: work.selectedToolId ?? "",
        explanation:
          "This visit is sealed. Open Work review, or Try again (same yard) for a new attempt.",
      },
    ],
  };
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
        // GATE-G: activeTaskId is camera guide only — allowed even when sealed
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
        // Sealed: no tool-select events or inventory side effects
        if (work.garden?.visitFinished) {
          if (toolId == null) {
            set({ work: { ...work, selectedToolId: null } });
          } else {
            set({ work: sealedBlock(work)! });
          }
          return;
        }
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
        const blocked = sealedBlock(work);
        if (blocked) {
          set({ work: blocked });
          return [];
        }
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
        // Record productive mow effort from real sweep path length (sample-count stable)
        let garden = snap.garden ? migrateGardenDomain(snap.garden) : snap.garden;
        const madeProgress = events.some((e) => e.kind === "progress");
        if (garden && madeProgress) {
          const samples = action.sweepSamples ?? [];
          let pathLen = 0;
          for (let i = 1; i < samples.length; i++) {
            const a = samples[i - 1]!;
            const b = samples[i]!;
            pathLen += Math.hypot(b.x - a.x, b.z - a.z);
          }
          // Fallback: one short step if samples missing
          if (pathLen < 0.05 && action.forwardMotion) pathLen = 0.35;
          // Game-modeled effort units per metre of effective forward path
          const effort = Math.min(2.5, Math.max(0.05, pathLen * 0.45));
          garden = applyGardenEvent(garden, {
            id: `mow:${action.strokeId ?? events[0]?.id}:${garden.events.length}`,
            type: "WORK_PERFORMED",
            taskId: "lawn",
            toolId: action.toolId,
            affectedIds: [],
            effort,
            worldFootprint: {
              x: action.worldX ?? 0,
              z: action.worldZ ?? 0,
              radius: 0.8,
              areaId: "lawn",
            },
          });
        } else if (garden && events.some((e) => e.kind === "ineffective")) {
          // Cap empty-ground thrashing — no productive credit
          if (garden.effort.ineffective < 4) {
            garden = {
              ...garden,
              effort: {
                ...garden.effort,
                ineffective: Math.min(4, garden.effort.ineffective + 0.05),
              },
            };
          }
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
        if (work.garden?.visitFinished) {
          set({ work: sealedBlock(work)! });
          return { ok: false, reason: "Visit sealed — try again to continue work." };
        }
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
        const blocked = sealedBlock(work);
        if (blocked) {
          set({ work: blocked });
          return;
        }
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
        const blocked = sealedBlock(work);
        if (blocked) {
          set({ work: blocked });
          return;
        }
        // Idempotent: re-inspecting the same object does not stack setup effort
        if (work.garden.inspection[objectId]?.observed) {
          set({
            work: {
              ...work,
              lastEvents: [
                {
                  id: "inspect-repeat",
                  kind: "progress",
                  zoneId: "",
                  toolId: "",
                  explanation: `Already noted: ${objectId}.`,
                },
              ],
            },
          });
          return;
        }
        let garden = applyGardenEvent(work.garden, {
          id: `inspect:${objectId}`,
          type: "INSPECTED",
          objectId,
          effort: objectId === "garden-overview" ? 0.2 : 0.3,
        });
        // Overview is a light scan — only task-level cues, not every hazard detail.
        // Players still click individual hazards for specific risk info.
        if (objectId === "garden-overview") {
          for (const id of ["hazard", "edge"]) {
            if (!garden.inspection[id]?.observed) {
              garden = applyGardenEvent(garden, {
                id: `inspect:${id}`,
                type: "INSPECTED",
                objectId: id,
                effort: 0.1,
              });
            }
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
                    ? "You notice a quieter path edge and that some lawn spots may hide stones — click specific hazards to learn more."
                    : `Inspected ${objectId}.`,
              },
            ],
          },
        });
      },

      removeHazard: (hazardId) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        const blocked = sealedBlock(work);
        if (blocked) {
          set({ work: blocked });
          return;
        }
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
        const blocked = sealedBlock(work);
        if (blocked) {
          set({ work: blocked });
          return;
        }
        const powered = toolId === "hedge-trimmer";
        const tool = work.tools[toolId];
        if (!tool) return;
        const cluster = work.garden.hedgeClusters[clusterId];
        if (!cluster) return;
        // Effect-first: no free consume when nothing will change (P1-03)
        const intentionalOvercut = Boolean(overcut) && cluster.cut && !cluster.overcut;
        if (cluster.cut && !intentionalOvercut) {
          set({
            work: {
              ...work,
              lastEvents: [
                {
                  id: "hedge-noop",
                  kind: "ineffective",
                  zoneId: "hedge",
                  toolId,
                  explanation: cluster.overcut
                    ? "That notch is already there — further passes do not change it."
                    : "Cluster already trimmed — a second intentional pass would overcut.",
                },
              ],
            },
          });
          return;
        }
        // Block powered trimmer near uncleared hardwood hazard (before consume)
        const hazardBlocks = Object.values(work.garden.hazards).some(
          (h) =>
            !h.cleared &&
            h.blocks.includes(toolId) &&
            Math.hypot(h.x - cluster.x, h.z - cluster.z) < 1.2,
        );
        if (hazardBlocks) {
          set({
            work: {
              ...work,
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
        const eventId = intentionalOvercut
          ? `hedge-overcut:${clusterId}:${toolId}`
          : `hedge-cut:${clusterId}:${toolId}`;
        set({
          work: {
            ...work,
            tools: { ...work.tools, [toolId]: guard.tool },
            garden: applyGardenEvent(work.garden, {
              id: eventId,
              type: "HEDGE_CLUSTER_CUT",
              clusterId,
              overcut: intentionalOvercut,
              effort: powered ? 0.35 : 0.55,
              worldFootprint: {
                x: cluster.x,
                z: cluster.z,
                radius: 1.0,
                areaId: "hedge",
              },
            }),
            lastEvents: [
              {
                id: "hedge",
                kind: "progress",
                zoneId: "hedge",
                toolId,
                explanation: intentionalOvercut
                  ? "Overcut left a lasting notch. Clippings already fell on the first cut."
                  : "Hedge cluster trimmed. Clippings landed on the ground.",
              },
            ],
          },
        });
      },

      pullWeed: (plantId) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        const blocked = sealedBlock(work);
        if (blocked) {
          set({ work: blocked });
          return;
        }
        const toolId = work.selectedToolId ?? "hand-weeder";
        if (toolId !== "hand-weeder") {
          set({
            work: {
              ...work,
              lastEvents: [
                {
                  id: "pull-tool",
                  kind: "ineffective",
                  zoneId: "flowerbed",
                  toolId,
                  explanation:
                    "Root removal needs the hand weeder — a trimmer only cuts tops.",
                },
              ],
            },
          });
          return;
        }
        const p = work.garden.plants[plantId];
        if (!p) return;
        if (p.kind === "flower") {
          get().damageFlower(plantId);
          return;
        }
        const tool = work.tools[toolId];
        if (!tool) return;
        const guard = guardAndConsumeTool(tool, toolId, {
          drain: false,
          wear: true,
        });
        if (!guard.ok) {
          set({
            work: {
              ...work,
              lastEvents: [
                {
                  id: "pull-block",
                  kind: "ineffective",
                  zoneId: "flowerbed",
                  toolId,
                  explanation: guard.reason ?? "Tool cannot work.",
                },
              ],
            },
          });
          return;
        }
        set({
          work: {
            ...work,
            tools: { ...work.tools, [toolId]: guard.tool },
            garden: applyGardenEvent(work.garden, {
              id: `pull:${plantId}`,
              type: "PLANT_ROOT_REMOVED",
              plantId,
              effort: 0.8,
              worldFootprint: {
                x: p.x,
                z: p.z,
                radius: 0.4,
                areaId: "flowerbed",
              },
            }),
            lastEvents: [
              {
                id: "pull",
                kind: "progress",
                zoneId: "flowerbed",
                toolId,
                explanation: "Weed pulled by the root. Debris left for cleanup.",
              },
            ],
          },
        });
      },

      topCutWeed: (plantId) => {
        const work = withGarden(get().work);
        if (!work.garden) return;
        const blocked = sealedBlock(work);
        if (blocked) {
          set({ work: blocked });
          return;
        }
        const toolId = work.selectedToolId ?? "string-trimmer";
        if (toolId !== "string-trimmer") {
          set({
            work: {
              ...work,
              lastEvents: [
                {
                  id: "top-tool",
                  kind: "ineffective",
                  zoneId: "flowerbed",
                  toolId,
                  explanation:
                    "Top-cutting needs the string trimmer. Use the hand weeder to pull roots.",
                },
              ],
            },
          });
          return;
        }
        const p = work.garden.plants[plantId];
        if (!p) return;
        if (p.kind === "flower") {
          get().damageFlower(plantId);
          return;
        }
        const tool = work.tools[toolId];
        if (!tool) return;
        const guard = guardAndConsumeTool(tool, toolId, {
          drain: true,
          wear: true,
        });
        if (!guard.ok) {
          set({
            work: {
              ...work,
              lastEvents: [
                {
                  id: "top-block",
                  kind: "not_powered",
                  zoneId: "flowerbed",
                  toolId,
                  explanation: guard.reason ?? "Tool cannot work.",
                },
              ],
            },
          });
          return;
        }
        set({
          work: {
            ...work,
            tools: { ...work.tools, [toolId]: guard.tool },
            garden: applyGardenEvent(work.garden, {
              id: `topcut:${plantId}`,
              type: "PLANT_TOP_CUT",
              plantId,
              effort: 0.3,
              worldFootprint: {
                x: p.x,
                z: p.z,
                radius: 0.5,
                areaId: "flowerbed",
              },
            }),
            lastEvents: [
              {
                id: "topcut",
                kind: "stubble",
                zoneId: "flowerbed",
                toolId,
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
        const blocked = sealedBlock(work);
        if (blocked) {
          set({ work: blocked });
          return;
        }
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
        const blocked = sealedBlock(work);
        if (blocked) {
          set({ work: blocked });
          return;
        }
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
        const blocked = sealedBlock(work);
        if (blocked) {
          set({ work: blocked });
          return;
        }
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
        const blocked = sealedBlock(work);
        if (blocked) {
          set({ work: blocked });
          return;
        }
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
        const blocked = sealedBlock(work);
        if (blocked) {
          set({ work: blocked });
          return;
        }
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
        const blocked = sealedBlock(work);
        if (blocked) {
          set({ work: blocked });
          return;
        }
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
        const radius = powered ? 0.55 : 0.35;
        const workPer = powered ? 28 : 22;
        // Probe hits first — do not drain on empty pointer samples (P1-09)
        let probe = work.garden.edgeSegments ?? {};
        const probeHit = new Set<string>();
        const pts = samples.length ? samples : [{ x, z }];
        for (const p of pts) {
          if (p.z > -2.6 || p.z < -4.3) continue;
          const res = applyEdgeStroke(probe, p.x, p.z, radius, workPer);
          probe = res.segments;
          res.hitIds.forEach((id) => probeHit.add(id));
        }
        if (probeHit.size === 0) {
          set({
            work: {
              ...work,
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
        let garden = {
          ...work.garden,
          edgeSegments: probe,
        };
        garden = applyGardenEvent(garden, {
          id: `edge:${toolId}:${garden.events.length}`,
          type: "EDGE_WORKED",
          segmentIds: [...probeHit],
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
        // Idempotent: already sealed — only reopen review (Q28)
        if (work.garden.visitFinished) {
          set({
            work: {
              ...work,
              garden: { ...work.garden, reviewOpen: true },
            },
          });
          return;
        }
        const sealed = buildVisitSummary(
          work.garden,
          work,
          `visit:${(work.garden.visitHistory ?? []).length}:${work.garden.events.length}`,
        );
        let garden = applyGardenEvent(work.garden, {
          id: `visit-finish:${work.garden.events.length}`,
          type: "VISIT_FINISHED",
          summaryNote: `Sealed ${sealed.qualityBand} visit (${Math.round(sealed.final.lawnPct)}% lawn / ${Math.round(sealed.final.edgePct)}% edge). Game-modeled effort, not real work minutes.`,
        });
        const history = [...(garden.visitHistory ?? []), sealed].slice(-3);
        garden = {
          ...garden,
          visitHistory: history,
          lastVisitNote: sealed.qualityBand,
          reviewOpen: true,
          activeTaskId: null,
        };
        set({
          work: {
            ...work,
            garden,
            focusedZoneId: null,
            selectedToolId: null,
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
