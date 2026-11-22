"use client";

import { LAWN_HOTSPOT } from "@/data/gardenScene";
import { Button } from "@/components/ui/Button";

export function WorkConfirm({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-20 flex items-end justify-center bg-stone-950/25 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-confirm-title"
    >
      <div className="w-full max-w-sm rounded-lg bg-[#f7f3ea] px-5 py-4 shadow-lg ring-1 ring-stone-900/10">
        <h2
          id="work-confirm-title"
          className="font-[family-name:var(--font-display)] text-xl text-stone-900"
        >
          {LAWN_HOTSPOT.confirmPrompt}
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Push a reel or powered mower across the grass. Partial passes stay.
          Wide careless strokes can clip the flower border.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Not now
          </Button>
          <Button onClick={onConfirm}>Start mowing</Button>
        </div>
      </div>
    </div>
  );
}
