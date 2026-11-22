"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type { Object3D } from "three";
import {
  GARDEN_HIDE_NAME_MATCHES,
  GARDEN_SCENE,
} from "@/data/gardenScene";

function shouldHide(name: string): boolean {
  const lower = name.toLowerCase();
  return GARDEN_HIDE_NAME_MATCHES.some((m) => lower.includes(m));
}

function applyHideList(root: Object3D) {
  root.traverse((obj) => {
    if (obj.name && shouldHide(obj.name)) {
      obj.visible = false;
    }
  });
}

/** CC0 starter scene with narrative / baked-lawn nodes hidden for player state. */
export function SaturdayGardenModel() {
  const { scene } = useGLTF(GARDEN_SCENE.localPath);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    applyHideList(cloned);
  }, [cloned]);

  return <primitive object={cloned} />;
}

useGLTF.preload(GARDEN_SCENE.localPath);
