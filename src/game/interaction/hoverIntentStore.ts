"use client";

import { create } from "zustand";
import type { HitKind } from "./toolTargetCapabilities";
import type { ToolIntent } from "./evaluateToolIntent";

export interface HoverHit {
  kind: HitKind;
  id?: string;
}

interface HoverIntentState {
  hit: HoverHit | null;
  intent: ToolIntent | null;
  setHover: (hit: HoverHit | null, intent: ToolIntent | null) => void;
  clearHover: () => void;
}

/** Ephemeral UI preview — never persisted, never mutates world/tools. */
export const useHoverIntent = create<HoverIntentState>((set) => ({
  hit: null,
  intent: null,
  setHover: (hit, intent) => set({ hit, intent }),
  clearHover: () => set({ hit: null, intent: null }),
}));
