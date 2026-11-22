import type { Player } from "@/game/types";
import { SAMPLE_TOOLS } from "./sampleTools";

export const SAMPLE_PLAYER: Player = {
  id: "player-1",
  displayName: "Yard Hand",
  balance: 120,
  ownedToolIds: SAMPLE_TOOLS.filter((t) => t.ownedByDefault).map((t) => t.id),
  completedJobIds: [],
};
