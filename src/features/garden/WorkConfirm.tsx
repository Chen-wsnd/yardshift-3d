"use client";

import { Button } from "@/components/ui/Button";

export function WorkConfirm({
  open,
  title,
  body,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
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
          {title}
        </h2>
        {body ? (
          <p className="mt-2 text-sm text-stone-600">{body}</p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Not now
          </Button>
          <Button onClick={onConfirm}>Start</Button>
        </div>
      </div>
    </div>
  );
}
