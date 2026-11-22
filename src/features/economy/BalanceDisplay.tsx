"use client";

import { useGameStore } from "@/game/store/gameStore";

export function BalanceDisplay() {
  const balance = useGameStore((state) => state.player.balance);
  const displayName = useGameStore((state) => state.player.displayName);

  return (
    <div
      className="flex items-center gap-3 rounded-md bg-emerald-50 px-3 py-1.5 text-sm text-emerald-950"
      aria-label="Player balance"
    >
      <span className="hidden text-stone-500 sm:inline">{displayName}</span>
      <span className="font-semibold tabular-nums">
        {balance}{" "}
        <span className="font-normal text-emerald-700/80">credits</span>
      </span>
    </div>
  );
}
