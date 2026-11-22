"use client";

import { useEffect, type ReactNode } from "react";
import { useGameStore } from "@/game/store/gameStore";

/** Ensures Zustand persist rehydration completes before gameplay UI relies on it. */
export function PersistGate({ children }: { children: ReactNode }) {
  const hydrated = useGameStore((s) => s.hydrated);
  const setHydrated = useGameStore((s) => s.setHydrated);

  useEffect(() => {
    const mark = () => setHydrated(true);
    const unsub = useGameStore.persist.onFinishHydration(mark);
    if (useGameStore.persist.hasHydrated()) {
      mark();
    }
    // Safety: never leave the UI stuck if the hydration event was missed
    const timeout = window.setTimeout(mark, 50);
    return () => {
      unsub();
      window.clearTimeout(timeout);
    };
  }, [setHydrated]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-600">
        Loading YardShift…
      </div>
    );
  }

  return children;
}
