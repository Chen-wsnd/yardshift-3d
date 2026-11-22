"use client";

import { useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";

const DRAG_THRESHOLD_PX = 8;

type PointerThreeEvent = ThreeEvent<PointerEvent>;

/**
 * Fires onTap only for short presses (not orbit drags).
 * Stops propagation so OrbitControls does not steal the gesture mid-tap.
 */
export function useTapInteraction(onTap: () => void, enabled: boolean) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);

  return {
    onPointerOver: (e: PointerThreeEvent) => {
      if (!enabled) return;
      e.stopPropagation();
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      document.body.style.cursor = "auto";
      start.current = null;
      dragged.current = false;
    },
    onPointerDown: (e: PointerThreeEvent) => {
      if (!enabled) return;
      e.stopPropagation();
      start.current = { x: e.clientX, y: e.clientY };
      dragged.current = false;
    },
    onPointerMove: (e: PointerThreeEvent) => {
      if (!enabled || !start.current) return;
      const dist = Math.hypot(
        e.clientX - start.current.x,
        e.clientY - start.current.y,
      );
      if (dist > DRAG_THRESHOLD_PX) {
        dragged.current = true;
      }
    },
    onPointerUp: (e: PointerThreeEvent) => {
      if (!enabled) return;
      e.stopPropagation();
      if (!dragged.current) {
        onTap();
      }
      start.current = null;
      dragged.current = false;
      document.body.style.cursor = "auto";
    },
  };
}
