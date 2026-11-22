"use client";

import { Button } from "@/components/ui/Button";
import { GARDEN_TASKS } from "@/data/gardenTasks";
import { useGameStore } from "@/game/store/gameStore";

export function WorkPlanPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const garden = useGameStore((s) => s.work.garden);
  const revisePlan = useGameStore((s) => s.revisePlan);
  if (!open || !garden) return null;
  const order = garden.plan.taskOrder;

  const move = (index: number, dir: -1 | 1) => {
    const next = [...order];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    revisePlan(next);
  };

  return (
    <div className="pointer-events-auto absolute right-3 top-14 z-20 w-72 rounded-lg bg-[#f7f3ea]/95 p-3 shadow-md ring-1 ring-stone-900/10">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-lg">
          Work plan
        </h2>
        <button type="button" className="text-sm text-stone-500" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="mt-1 text-xs text-stone-500">
        Optional. You can ignore this list and work in any order.
      </p>
      <ol className="mt-3 space-y-1">
        {order.map((id, i) => {
          const task = GARDEN_TASKS.find((t) => t.id === id);
          return (
            <li
              key={id}
              className="flex items-center justify-between rounded bg-white/80 px-2 py-1 text-sm"
            >
              <span>
                {i + 1}. {task?.name ?? id}
              </span>
              <span className="flex gap-1">
                <Button variant="ghost" onClick={() => move(i, -1)}>
                  ↑
                </Button>
                <Button variant="ghost" onClick={() => move(i, 1)}>
                  ↓
                </Button>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
