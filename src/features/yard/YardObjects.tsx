"use client";

import { useMemo, useState } from "react";
import { useGameStore } from "@/game/store/gameStore";
import type { YardObject } from "@/game/types";
import { ClickProxy } from "./interaction/ClickProxy";
import {
  DecorBush,
  DecorPath,
  DecorTree,
  TargetVisual,
} from "./visuals/TargetVisuals";

function proxySizeFor(object: YardObject): [number, number, number] {
  const s = object.scale ?? [1, 1, 1];
  switch (object.targetKind) {
    case "long_lawn":
      return [Math.max(s[0] * 1.1, 1.8), 1.2, Math.max(s[2] * 1.1, 1.6)];
    case "lawn_edge":
      return [1.2, 1.2, Math.max(s[2] * 1.05, 2.2)];
    case "fallen_branch":
      return [2.2, 1.0, 1.2];
    case "hedge":
      return [1.8, 1.8, 1.6];
    case "leaves":
      return [1.8, 1.2, 1.6];
    default:
      return [1.5, 1.4, 1.5];
  }
}

function ObjectiveObject({
  object,
  onInteract,
}: {
  object: YardObject;
  onInteract: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const cleaned =
    object.cleaned || object.interactionState === "cleaned";
  const [x, y, z] = object.position;
  const scale = object.scale ?? [1, 1, 1];
  const highlight = hovered && !cleaned;

  return (
    <group position={[x, 0, z]}>
      <group position={[0, y, 0]}>
        <TargetVisual
          targetKind={object.targetKind}
          cleaned={cleaned}
          highlight={highlight}
          scale={scale}
        />
      </group>
      <ClickProxy
        position={[0, 0.45, 0]}
        size={proxySizeFor(object)}
        enabled={!cleaned}
        onInteract={() => onInteract(object.id)}
        onHoverChange={setHovered}
        showHoverRing
      />
    </group>
  );
}

function DecorativeObject({ object }: { object: YardObject }) {
  const [x, y, z] = object.position;
  const scale = object.scale ?? [1, 1, 1];

  if (object.id === "decor-path") {
    return (
      <group position={[x, y, z]}>
        <DecorPath scale={scale} />
      </group>
    );
  }

  if (object.kind === "tree") {
    return (
      <group position={[x, 0, z]}>
        <DecorTree scale={scale} />
      </group>
    );
  }

  if (object.kind === "bush") {
    return (
      <group position={[x, y, z]}>
        <DecorBush scale={scale} />
      </group>
    );
  }

  return null;
}

export function YardObjects() {
  const objects = useGameStore((state) => state.yard.objects);
  const interactWithObject = useGameStore((state) => state.interactWithObject);
  const list = useMemo(() => objects, [objects]);

  return (
    <group>
      {list.map((obj) =>
        obj.isObjective && obj.targetKind !== "decorative" ? (
          <ObjectiveObject
            key={obj.id}
            object={obj}
            onInteract={interactWithObject}
          />
        ) : (
          <DecorativeObject key={obj.id} object={obj} />
        ),
      )}
    </group>
  );
}
