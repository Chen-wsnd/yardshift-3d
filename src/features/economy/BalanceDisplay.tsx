"use client";

import { useGameStore } from "@/game/store/gameStore";

export function BalanceDisplay() {
  const balance = useGameStore((s) => s.work.balance);

  return (
    <div
      className="flex items-center gap-3 rounded-md bg-emerald-50 px-3 py-1.5 text-sm text-emerald-950"
      aria-label="Player balance"
    >
      <span className="font-semibold tabular-nums">
        {balance}{" "}
        <span className="font-normal text-emerald-700/80">credits</span>
      </span>
    </div>
  );
}
