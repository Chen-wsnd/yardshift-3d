"use client";

import { EQUIPMENT_PROFILES } from "@/data/equipmentProfiles";
import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/game/store/gameStore";

export function RentalControls() {
  const work = useGameStore((s) => s.work);
  const rentTool = useGameStore((s) => s.rentTool);
  const purchaseTool = useGameStore((s) => s.purchaseTool);
  const rentables = EQUIPMENT_PROFILES.filter((p) => !p.ownedByDefault);

  if (!work.activeJobId) {
    return (
      <p className="text-sm text-stone-500">
        Accept a job to rent powered tools for this contract.
      </p>
    );
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {rentables.map((p) => {
        const owned = work.ownedToolIds.includes(p.id);
        const rented = work.rentedToolIds.includes(p.id);
        return (
          <li
            key={p.id}
            className="rounded-md border border-stone-200 bg-white/70 p-3 text-sm"
          >
            <p className="font-medium">
              {p.emoji} {p.name}
            </p>
            <p className="text-xs text-stone-500">
              Buy {p.purchaseCredits} · Rent {p.rentalCredits}/job
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {owned ? (
                <span className="text-xs text-emerald-700">Owned</span>
              ) : rented ? (
                <span className="text-xs text-amber-700">Rented this job</span>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => rentTool(p.id)}
                    disabled={work.balance < p.rentalCredits}
                  >
                    Rent
                  </Button>
                  <Button
                    onClick={() => purchaseTool(p.id)}
                    disabled={work.balance < p.purchaseCredits}
                  >
                    Buy
                  </Button>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
