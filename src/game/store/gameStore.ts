"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EQUIPMENT_PROFILES, JOB_BASE_PAYOUT } from "@/data/equipmentProfiles";
import {
  applyClearJam,
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
import { applyWorkAction } from "@/game/work/engine";
import { createFreshV02Snapshot, makeJobState } from "@/game/work/fixtures";
import { createFreshV03GardenSnapshot } from "@/game/work/gardenFixtures";
import { feesForJob } from "@/game/work/selectors";
import type { WorkAction, WorkEvent, WorkSnapshot } from "@/game/work/types";

/** New garden path. Leaves legacy `yardshift-v02` saves untouched. */
const PERSIST_KEY = "yardshift-v03";

interface GameState {
  work: WorkSnapshot;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  startV03Garden: () => void;
  startV02Demo: () => void;
  resetDemo: () => void;
  acceptJob: (jobId: string) => boolean;
  focusZone: (zoneId: string | null) => void;
  selectTool: (toolId: string | null) => void;
  performWorkAction: (action: Omit<WorkAction, "jobId"> & { jobId?: string }) => WorkEvent[];
  rentTool: (toolId: string) => { ok: boolean; reason?: string };
  purchaseTool: (toolId: string) => { ok: boolean; reason?: string };
  repairTool: (toolId: string) => { ok: boolean; reason?: string };
  refillTool: (toolId: string) => { ok: boolean; reason?: string };
  clearJam: (toolId: string) => void;
  finishJob: (early: boolean) => { ok: boolean; reason?: string; net?: number };
  claimReward: (jobId: string) => boolean;
  isJobUnlocked: (jobId: string) => boolean;
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

      selectTool: (toolId) => {
        set({ work: { ...get().work, selectedToolId: toolId } });
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
        set({ work: snap });
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
      onRehydrateStorage: () => (state) => {
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
