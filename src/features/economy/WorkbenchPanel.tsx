"use client";

import { EQUIPMENT_PROFILES } from "@/data/equipmentProfiles";
import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/game/store/gameStore";

export function WorkbenchPanel() {
  const work = useGameStore((s) => s.work);
  const repairTool = useGameStore((s) => s.repairTool);

  const damaged = EQUIPMENT_PROFILES.filter((p) => {
    const t = work.tools[p.id];
    return (
      t &&
      (work.ownedToolIds.includes(p.id) || work.rentedToolIds.includes(p.id)) &&
      (t.status === "broken" || t.status === "jammed" || t.condition < 40)
    );
  });

  return (
    <section className="border-t border-stone-200 pt-6">
      <h2 className="font-[family-name:var(--font-display)] text-xl text-stone-900">
        Workbench
      </h2>
      <p className="mt-1 text-sm text-stone-600">
        Repair worn or broken tools. Fees are booked once per incident.
      </p>
      {damaged.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">No tools need service.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {damaged.map((p) => {
            const t = work.tools[p.id];
            return (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-md bg-stone-100 px-3 py-2 text-sm"
              >
                <span>
                  {p.name} — {t.status}, cond {Math.round(t.condition)}
                </span>
                <Button onClick={() => repairTool(p.id)}>Repair</Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
