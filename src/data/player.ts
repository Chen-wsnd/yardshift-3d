import type { Player } from "@/game/types";
import { STARTER_TOOL_IDS } from "./tools";

export const INITIAL_PLAYER: Player = {
  id: "player-1",
  displayName: "Yard Hand",
  balance: 40,
  ownedToolIds: [...STARTER_TOOL_IDS],
  completedJobIds: [],
};

/** @deprecated Use INITIAL_PLAYER */
export const SAMPLE_PLAYER = INITIAL_PLAYER;
