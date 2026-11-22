"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { JOB2_LOANER_TOOL_IDS, JOBS } from "@/data/jobs";
import {
  BASE_YARD,
  cloneLayoutObjects,
  getLayoutByJobId,
} from "@/data/layouts";
import { INITIAL_PLAYER } from "@/data/player";
import { TOOLS } from "@/data/tools";
import { canClaimReward, canPurchaseTool } from "@/game/rules/economyRules";
import {
  canAcceptJob,
  getJobProgress,
  isJobUnlocked,
} from "@/game/rules/jobRules";
import { evaluateToolUse } from "@/game/rules/toolRules";
import type {
  GameProgress,
  GardeningTool,
  Job,
  JobProgress,
  Player,
  ToolAvailability,
  ToolInteractionResult,
  Yard,
  YardObject,
} from "@/game/types";

const PERSIST_KEY = "yardshift-v01";

interface GameState {
  player: Player;
  jobs: Job[];
  tools: GardeningTool[];
  yard: Yard;
  progress: GameProgress;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  acceptJob: (jobId: string) => boolean;
  enterActiveJob: () => boolean;
  /** @deprecated use enterActiveJob */
  enterYardForActiveJob: () => boolean;
  selectTool: (toolId: string | null) => void;
  interactWithObject: (objectId: string) => ToolInteractionResult;
  getActiveJobProgress: () => JobProgress | null;
  completeJobIfReady: () => boolean;
  claimReward: (jobId: string) => boolean;
  purchaseTool: (toolId: string) => { ok: boolean; reason?: string };
  getToolAvailability: (toolId: string) => ToolAvailability;
  resetDemo: () => void;
  clearFeedback: () => void;
  dismissCompletionModal: () => void;
}

const initialProgress = (): GameProgress => ({
  activeJobId: null,
  selectedToolId: "rake",
  jobsCompleted: 0,
  totalCreditsEarned: 0,
  tutorialCompleted: false,
  claimedRewardJobIds: [],
  loanedToolIds: [],
  lastFeedback: null,
  showCompletionModal: false,
});

function freshJobs(): Job[] {
  return JOBS.map((job) => ({
    ...job,
    status: job.unlockAfterJobId ? "locked" : "available",
  }));
}

function emptyYard(): Yard {
  return { ...BASE_YARD, objects: [] };
}

function loadYardForJob(jobId: string): YardObject[] {
  const layout = getLayoutByJobId(jobId);
  if (!layout) return [];
  return cloneLayoutObjects(layout);
}

function computeLoaners(
  jobId: string,
  ownedToolIds: string[],
): string[] {
  if (jobId !== "job-backyard-restoration") return [];
  return JOB2_LOANER_TOOL_IDS.filter((id) => !ownedToolIds.includes(id));
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      player: { ...INITIAL_PLAYER, ownedToolIds: [...INITIAL_PLAYER.ownedToolIds] },
      jobs: freshJobs(),
      tools: TOOLS,
      yard: emptyYard(),
      progress: initialProgress(),
      hydrated: false,

      setHydrated: (value) => set({ hydrated: value }),

      acceptJob: (jobId) => {
        const { player, jobs, progress } = get();
        const job = jobs.find((j) => j.id === jobId);
        if (!job) return false;

        const unlocked = isJobUnlocked(job, progress.claimedRewardJobIds);
        const normalized: Job = {
          ...job,
          status:
            job.status === "locked" && unlocked ? "available" : job.status,
        };

        if (!canAcceptJob(player, normalized, progress.claimedRewardJobIds)) {
          return false;
        }

        const loanedToolIds = computeLoaners(jobId, player.ownedToolIds);
        const objects = loadYardForJob(jobId);

        set({
          jobs: jobs.map((j) =>
            j.id === jobId
              ? { ...j, status: "accepted" }
              : j.status === "locked" &&
                  isJobUnlocked(j, progress.claimedRewardJobIds)
                ? { ...j, status: "available" }
                : j,
          ),
          yard: { ...BASE_YARD, objects },
          progress: {
            ...progress,
            activeJobId: jobId,
            loanedToolIds,
            lastFeedback: loanedToolIds.length
              ? `Demo loaners equipped: ${loanedToolIds.join(", ")}`
              : "Job accepted — enter the yard.",
            showCompletionModal: false,
            selectedToolId:
              progress.selectedToolId ??
              player.ownedToolIds[0] ??
              loanedToolIds[0] ??
              null,
          },
        });
        return true;
      },

      enterActiveJob: () => {
        const { progress, jobs } = get();
        if (!progress.activeJobId) return false;
        set({
          jobs: jobs.map((j) =>
            j.id === progress.activeJobId
              ? { ...j, status: "in_progress" }
              : j,
          ),
        });
        return true;
      },

      enterYardForActiveJob: () => get().enterActiveJob(),

      selectTool: (toolId) => {
        set({
          progress: {
            ...get().progress,
            selectedToolId: toolId,
            lastFeedback: toolId
              ? `Selected ${get().tools.find((t) => t.id === toolId)?.name ?? toolId}`
              : null,
          },
        });
      },

      getToolAvailability: (toolId) => {
        const { player, progress } = get();
        if (player.ownedToolIds.includes(toolId)) return "owned";
        if (progress.loanedToolIds.includes(toolId)) return "loaned";
        const tool = TOOLS.find((t) => t.id === toolId);
        if (tool && !tool.ownedByDefault) return "available_for_purchase";
        return "locked";
      },

      interactWithObject: (objectId) => {
        const state = get();
        const object = state.yard.objects.find((o) => o.id === objectId);
        if (!object) {
          const fail = { success: false, message: "Object not found." };
          set({
            progress: { ...state.progress, lastFeedback: fail.message },
          });
          return fail;
        }

        const toolId = state.progress.selectedToolId;
        const availability = toolId
          ? state.getToolAvailability(toolId)
          : "locked";

        const usableAvailability: ToolAvailability =
          availability === "owned" || availability === "loaned"
            ? availability
            : "locked";

        const result = evaluateToolUse(
          toolId,
          object.targetKind,
          object.interactionState,
          usableAvailability,
        );

        if (!result.success) {
          set({
            progress: { ...state.progress, lastFeedback: result.message },
          });
          return { ...result, objectId };
        }

        // Idempotent clean — only first success counts
        if (object.cleaned || object.interactionState === "cleaned") {
          const already = {
            success: false,
            message: "Already cleaned.",
            objectId,
            effectType: "none" as const,
          };
          set({
            progress: { ...state.progress, lastFeedback: already.message },
          });
          return already;
        }

        const objects = state.yard.objects.map((o) =>
          o.id === objectId
            ? {
                ...o,
                cleaned: true,
                interactionState: "cleaned" as const,
              }
            : o,
        );

        const activeJob = state.jobs.find(
          (j) => j.id === state.progress.activeJobId,
        );
        const jobProgress = activeJob
          ? getJobProgress(activeJob.id, objects, activeJob.objectiveIds)
          : null;

        set({
          yard: { ...state.yard, objects },
          progress: {
            ...state.progress,
            lastFeedback: result.message,
            showCompletionModal: jobProgress?.complete ?? false,
          },
        });

        return { ...result, objectId };
      },

      getActiveJobProgress: () => {
        const { progress, jobs, yard } = get();
        if (!progress.activeJobId) return null;
        const job = jobs.find((j) => j.id === progress.activeJobId);
        if (!job) return null;
        return getJobProgress(job.id, yard.objects, job.objectiveIds);
      },

      completeJobIfReady: () => {
        const progress = get().getActiveJobProgress();
        return Boolean(progress?.complete);
      },

      claimReward: (jobId) => {
        const state = get();
        const job = state.jobs.find((j) => j.id === jobId);
        if (!job) return false;

        const objects =
          state.progress.activeJobId === jobId
            ? state.yard.objects
            : loadYardForJob(jobId);

        const jobProgress = getJobProgress(job.id, objects, job.objectiveIds);
        const claim = canClaimReward(
          jobId,
          jobProgress.complete || job.status === "completed",
          state.progress.claimedRewardJobIds,
        );
        if (!claim.ok) {
          set({
            progress: {
              ...state.progress,
              lastFeedback: claim.reason,
            },
          });
          return false;
        }

        // Guard double-claim
        if (state.progress.claimedRewardJobIds.includes(jobId)) {
          return false;
        }

        const payout = job.reward.amount;
        const claimedRewardJobIds = [
          ...state.progress.claimedRewardJobIds,
          jobId,
        ];

        set({
          player: {
            ...state.player,
            balance: state.player.balance + payout,
            completedJobIds: state.player.completedJobIds.includes(jobId)
              ? state.player.completedJobIds
              : [...state.player.completedJobIds, jobId],
          },
          jobs: state.jobs.map((j) => {
            if (j.id === jobId) {
              return { ...j, status: "completed" };
            }
            if (
              j.unlockAfterJobId === jobId &&
              (j.status === "locked" || j.status === "available")
            ) {
              return { ...j, status: "available" };
            }
            return j;
          }),
          progress: {
            ...state.progress,
            claimedRewardJobIds,
            jobsCompleted: state.progress.jobsCompleted + 1,
            totalCreditsEarned: state.progress.totalCreditsEarned + payout,
            loanedToolIds: [],
            activeJobId: null,
            showCompletionModal: false,
            lastFeedback: `Claimed ${payout} credits!`,
          },
        });
        return true;
      },

      purchaseTool: (toolId) => {
        const state = get();
        const result = canPurchaseTool(state.player, toolId);
        if (!result.ok) {
          set({
            progress: {
              ...state.progress,
              lastFeedback: result.reason,
            },
          });
          return { ok: false, reason: result.reason };
        }

        set({
          player: {
            ...state.player,
            balance: result.newBalance,
            ownedToolIds: [...state.player.ownedToolIds, toolId],
          },
          progress: {
            ...state.progress,
            loanedToolIds: state.progress.loanedToolIds.filter(
              (id) => id !== toolId,
            ),
            lastFeedback: `Purchased ${result.tool.name}.`,
          },
        });
        return { ok: true };
      },

      resetDemo: () => {
        set({
          player: {
            ...INITIAL_PLAYER,
            ownedToolIds: [...INITIAL_PLAYER.ownedToolIds],
          },
          jobs: freshJobs(),
          yard: emptyYard(),
          progress: initialProgress(),
        });
      },

      clearFeedback: () => {
        set({
          progress: { ...get().progress, lastFeedback: null },
        });
      },

      dismissCompletionModal: () => {
        set({
          progress: { ...get().progress, showCompletionModal: false },
        });
      },
    }),
    {
      name: PERSIST_KEY,
      version: 1,
      partialize: (state) => ({
        player: state.player,
        jobs: state.jobs,
        yard: state.yard,
        progress: {
          ...state.progress,
          // Don't persist transient UI noise indefinitely — keep rewards/jobs
          lastFeedback: null,
          showCompletionModal: state.progress.showCompletionModal,
        },
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

/** Browser QA / demo console access — not used by UI. */
declare global {
  interface Window {
    __yardshift?: typeof useGameStore;
  }
}

if (typeof window !== "undefined") {
  window.__yardshift = useGameStore;
}
