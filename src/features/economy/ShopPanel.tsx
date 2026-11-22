"use client";

import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/game/store/gameStore";

export function ShopPanel() {
  const tools = useGameStore((s) => s.tools);
  const owned = useGameStore((s) => s.player.ownedToolIds);
  const balance = useGameStore((s) => s.player.balance);
  const purchaseTool = useGameStore((s) => s.purchaseTool);
  const claimed = useGameStore((s) => s.progress.claimedRewardJobIds);
  const shopUnlocked = claimed.includes("job-overgrown-lawn");

  const catalog = tools.filter((t) => !t.ownedByDefault);

  return (
    <section
      aria-labelledby="shop-heading"
      className="border-t border-stone-200 pt-8"
    >
      <h2
        id="shop-heading"
        className="font-[family-name:var(--font-display)] text-2xl text-stone-900"
      >
        Tool Shop
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        {shopUnlocked
          ? "Spend credits on advanced equipment. Owned tools cannot be bought again."
          : "Finish Job 1 and claim its reward to unlock purchases (Job 2 also grants demo loaners)."}
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {catalog.map((tool) => {
          const isOwned = owned.includes(tool.id);
          const canBuy =
            shopUnlocked && !isOwned && balance >= tool.purchasePrice;
          return (
            <li
              key={tool.id}
              className="flex flex-col gap-2 rounded-md border border-stone-200 bg-white/70 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-stone-900">
                    <span aria-hidden className="mr-1">
                      {tool.emoji}
                    </span>
                    {tool.name}
                  </p>
                  <p className="text-xs text-stone-500">{tool.description}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-emerald-800">
                  {tool.purchasePrice} cr
                </p>
              </div>
              {isOwned ? (
                <span className="text-xs font-medium text-emerald-700">
                  Owned
                </span>
              ) : (
                <Button
                  variant="secondary"
                  disabled={!canBuy}
                  onClick={() => purchaseTool(tool.id)}
                  title={
                    !shopUnlocked
                      ? "Unlock after claiming Job 1 reward"
                      : balance < tool.purchasePrice
                        ? "Insufficient credits"
                        : undefined
                  }
                >
                  Buy
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
