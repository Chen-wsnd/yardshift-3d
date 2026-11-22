"use client";

import { useGameStore } from "@/game/store/gameStore";
import { interactionLayersForTool } from "@/game/interaction/toolTargetCapabilities";
import { LawnTaskStage } from "./LawnTaskStage";
import { HedgeTaskStage } from "./HedgeTaskStage";
import { DebrisTaskStage } from "./DebrisTaskStage";
import { FlowerbedTaskStage } from "./FlowerbedTaskStage";
import { HazardTaskStage } from "./HazardTaskStage";
import { EdgeTaskStage } from "./EdgeTaskStage";

/**
 * Tool-first world interaction (GATE-G).
 * Mounts only the layer(s) matching the selected tool — never gated by activeTaskId.
 */
export function GardenInteractionLayer({
  onDragChange,
}: {
  onDragChange?: (d: boolean) => void;
}) {
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const sealed = useGameStore((s) => s.work.garden?.visitFinished);
  if (sealed) return null;

  const layers = interactionLayersForTool(selectedToolId);

  return (
    <group>
      {layers.includes("lawn") ? (
        <LawnTaskStage onDragChange={onDragChange} />
      ) : null}
      {layers.includes("hedge") ? (
        <HedgeTaskStage onDragChange={onDragChange} />
      ) : null}
      {layers.includes("debris") ? (
        <DebrisTaskStage onDragChange={onDragChange} />
      ) : null}
      {layers.includes("flowerbed") ? <FlowerbedTaskStage /> : null}
      {layers.includes("hazard") ? <HazardTaskStage /> : null}
      {layers.includes("edge") ? (
        <EdgeTaskStage onDragChange={onDragChange} />
      ) : null}
    </group>
  );
}
