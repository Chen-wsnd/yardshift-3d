"use client";

import { useState } from "react";
import { Html } from "@react-three/drei";
import { evaluateToolIntent } from "@/game/interaction/evaluateToolIntent";
import { useHoverIntent } from "@/game/interaction/hoverIntentStore";
import { useGameStore } from "@/game/store/gameStore";
import { useLocale } from "@/i18n/LocaleProvider";

function isHardwood(h: { id: string; label: string; blocks: string[] }) {
  return (
    h.id.includes("hardwood") ||
    h.label.toLowerCase().includes("wood") ||
    (h.blocks.includes("hedge-trimmer") && !h.blocks.includes("lawn-mower"))
  );
}

/**
 * Hazard pedagogy (G04): Inspect ≠ Clear.
 * Stone: inspect → move aside with Hands.
 * Hardwood: inspect → mark/avoid (no fake hand clear).
 */
export function HazardTaskStage() {
  const { t } = useLocale();
  const hazards = useGameStore((s) => s.work.garden?.hazards);
  const garden = useGameStore((s) => s.work.garden);
  const selectedToolId = useGameStore((s) => s.work.selectedToolId);
  const tool = useGameStore((s) =>
    s.work.selectedToolId ? s.work.tools[s.work.selectedToolId] : null,
  );
  const inspectObject = useGameStore((s) => s.inspectObject);
  const removeHazard = useGameStore((s) => s.removeHazard);
  const inspection = useGameStore((s) => s.work.garden?.inspection);
  const setHover = useHoverIntent((s) => s.setHover);
  const clearHover = useHoverIntent((s) => s.clearHover);
  const [hoverId, setHoverId] = useState<string | null>(null);

  if (!hazards) return null;

  // World meshes for Hands. Screen HUD lives in GardenShell (reliable 2D).
  const list = Object.values(hazards).filter((h) => !h.cleared);

  return (
    <group>
      {list.map((h) => {
        const seen = inspection?.[h.id]?.observed;
        const wood = isHardwood(h);
        const hovered = hoverId === h.id;
        const publish = () => {
          setHoverId(h.id);
          const intent = evaluateToolIntent(
            selectedToolId,
            { kind: "hazard", id: h.id },
            { garden, tool },
          );
          setHover({ kind: "hazard", id: h.id }, intent);
        };
        return (
          <group key={h.id} position={[h.x, 0.05, h.z]}>
            {/* Danger radius ring — visual only */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.02, 0]}
              raycast={() => null}
            >
              <ringGeometry args={[0.55, 0.7, 24]} />
              <meshBasicMaterial
                color={seen ? (wood ? "#b45309" : "#c45") : "#888"}
                transparent
                opacity={0.4}
                depthWrite={false}
              />
            </mesh>
            {/* Tall pick proxy so yard props (tractor/GLB) cannot steal Hands hits */}
            <mesh
              position={[0, 0.75, 0]}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
                publish();
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
                setHoverId(null);
                clearHover();
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!seen) {
                  inspectObject(h.id);
                  return;
                }
                if (selectedToolId == null || selectedToolId === "hand-weeder") {
                  removeHazard(h.id);
                } else {
                  removeHazard(h.id);
                }
              }}
            >
              <sphereGeometry args={[0.7, 12, 12]} />
              <meshBasicMaterial
                transparent
                opacity={hovered ? 0.35 : 0.14}
                depthWrite={false}
                color={wood ? "#b45309" : "#94a3b8"}
              />
            </mesh>
            <mesh position={[0, 0.22, 0]} raycast={() => null}>
              {wood ? (
                <boxGeometry args={[0.45, 0.35, 0.28]} />
              ) : (
                <dodecahedronGeometry args={[0.28, 0]} />
              )}
              <meshStandardMaterial
                color={
                  wood
                    ? seen
                      ? "#6b4423"
                      : "#4a3420"
                    : seen
                      ? "#a0a8b0"
                      : "#6a7078"
                }
              />
            </mesh>
            {(hovered || seen) && (
              <Html distanceFactor={14} position={[0, 1.2, 0]} center>
                <div
                  className="pointer-events-none max-w-[120px] rounded bg-white/90 px-1.5 py-1 text-[10px] text-stone-700 shadow"
                  role="status"
                >
                  {wood ? t("hazard.hardwood") : t("hazard.stone")}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
