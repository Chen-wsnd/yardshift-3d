"use client";

import { create } from "zustand";
import { SAMPLE_JOBS } from "@/data/sampleJobs";
import { SAMPLE_PLAYER } from "@/data/samplePlayer";
import { SAMPLE_TOOLS } from "@/data/sampleTools";
import { SAMPLE_YARD } from "@/data/sampleYard";
import { canAcceptJob } from "@/game/rules/jobRules";
import type {
  GameProgress,
  GardeningTool,
  Job,
  Player,
  Yard,
} from "@/game/types";

interface GameState {
  player: Player;
  jobs: Job[];
  tools: GardeningTool[];
  yard: Yard;
  progress: GameProgress;
  acceptJob: (jobId: string) => boolean;
  selectTool: (toolId: string | null) => void;
  enterYardForActiveJob: () => boolean;
}

const initialProgress: GameProgress = {
  activeJobId: null,
  selectedToolId: SAMPLE_TOOLS[0]?.id ?? null,
  jobsCompleted: 0,
  totalCreditsEarned: 0,
  tutorialCompleted: false,
};

export const useGameStore = create<GameState>((set, get) => ({
  player: SAMPLE_PLAYER,
  jobs: SAMPLE_JOBS.map((job) => ({ ...job })),
  tools: SAMPLE_TOOLS,
  yard: {
    ...SAMPLE_YARD,
    objects: SAMPLE_YARD.objects.map((obj) => ({ ...obj })),
  },
  progress: initialProgress,

  acceptJob: (jobId) => {
    const { player, jobs } = get();
    const job = jobs.find((j) => j.id === jobId);
    if (!job || !canAcceptJob(player, job)) {
      return false;
    }

    set({
      jobs: jobs.map((j) =>
        j.id === jobId ? { ...j, status: "accepted" } : j,
      ),
      progress: {
        ...get().progress,
        activeJobId: jobId,
      },
    });
    return true;
  },

  selectTool: (toolId) => {
    set({
      progress: {
        ...get().progress,
        selectedToolId: toolId,
      },
    });
  },

  enterYardForActiveJob: () => {
    const { progress, jobs } = get();
    if (!progress.activeJobId) {
      return false;
    }

    set({
      jobs: jobs.map((j) =>
        j.id === progress.activeJobId ? { ...j, status: "in_progress" } : j,
      ),
    });
    return true;
  },
}));
