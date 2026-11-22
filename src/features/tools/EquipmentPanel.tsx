"use client";

import { EQUIPMENT_PROFILES } from "@/data/equipmentProfiles";
import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/game/store/gameStore";

export function EquipmentPanel() {
  const work = useGameStore((s) => s.work);
  const selectTool = useGameStore((s) => s.selectTool);
  const clearJam = useGameStore((s) => s.clearJam);
  const refillTool = useGameStore((s) => s.refillTool);

  const usable = EQUIPMENT_PROFILES.filter(
    (p) =>
      work.ownedToolIds.includes(p.id) || work.rentedToolIds.includes(p.id),
  );

  const selected = work.tools[work.selectedToolId ?? ""];

  return (
    <aside className="flex w-full flex-col gap-3 border-t border-stone-200 bg-white/90 p-4 sm:max-w-xs sm:border-l sm:border-t-0">
      <h2 className="font-[family-name:var(--font-display)] text-lg text-stone-900">
        Toolbox
      </h2>
      <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
        {usable.map((p) => {
          const inst = work.tools[p.id];
          const active = work.selectedToolId === p.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => selectTool(p.id)}
                className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${
                  active ? "bg-emerald-700 text-white" : "bg-stone-100 hover:bg-stone-200"
                }`}
              >
                <span className="font-medium">
                  {p.emoji} {p.name}
                </span>
                <span
                  className={`mt-0.5 block text-[11px] ${active ? "text-emerald-100" : "text-stone-500"}`}
                >
                  {inst?.status} · cond {Math.round(inst?.condition ?? 0)}
                  {inst && inst.resourceType !== "none"
                    ? ` · ${inst.resourceType} ${Math.round(inst.resource)}`
                    : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {selected ? (
        <div className="space-y-2 border-t border-stone-100 pt-2 text-xs text-stone-600">
          <p>
            Condition {Math.round(selected.condition)} / 100 · Status{" "}
            {selected.status}
          </p>
          {selected.status === "jammed" ? (
            <Button onClick={() => clearJam(selected.id)}>Clear jam</Button>
          ) : null}
          {selected.resourceType !== "none" ? (
            <Button variant="secondary" onClick={() => refillTool(selected.id)}>
              Recharge / refill
            </Button>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
