import type { EdgeSegment } from "./types";

/**
 * Path–lawn interface segments near measured path slabs (south, z≈-3.6).
 * Independent of lawn WorkCells — finishing lawn does not finish edge.
 */
export function createEdgeSegments(): Record<string, EdgeSegment> {
  const out: Record<string, EdgeSegment> = {};
  // Along south lawn edge / path interface
  for (let i = 0; i < 12; i++) {
    const x = -4.5 + i * 0.85;
    const id = `edge-south-${i}`;
    out[id] = {
      id,
      x,
      z: -3.55,
      remaining: 100,
      finished: false,
    };
  }
  return out;
}

export function applyEdgeStroke(
  segments: Record<string, EdgeSegment>,
  x: number,
  z: number,
  radius: number,
  workPerHit: number,
): { segments: Record<string, EdgeSegment>; hitIds: string[] } {
  const next = { ...segments };
  const hitIds: string[] = [];
  for (const seg of Object.values(segments)) {
    if (seg.finished) continue;
    if ((seg.x - x) ** 2 + (seg.z - z) ** 2 > radius * radius) continue;
    const remaining = Math.max(0, seg.remaining - workPerHit);
    next[seg.id] = {
      ...seg,
      remaining,
      finished: remaining <= 0,
    };
    hitIds.push(seg.id);
  }
  return { segments: next, hitIds };
}
