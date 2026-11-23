/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest";
import { createFreshGardenDomain } from "./fixtures";
import { migrateGardenDomain } from "./migrateGarden";
import { buildReviewSummary } from "./reviewSelectors";
import { FIXTURE_VERSION } from "@/game/learning/toolKnowledge";
import { useGameStore } from "@/game/store/gameStore";

describe("freeze: reachable acceptable path", () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().startV03Garden();
  });

  it("fresh yard has only clearable stone hazard", () => {
    const g = createFreshGardenDomain();
    expect(Object.keys(g.hazards)).toEqual(["lawn-stone-1"]);
    expect(g.hazards["lawn-stone-1"].requiredForReview).not.toBe(false);
  });

  it("legacy hardwood migrates to non-required and does not gate quality", () => {
    const raw = createFreshGardenDomain();
    raw.hazards["hedge-hardwood-1"] = {
      id: "hedge-hardwood-1",
      x: 6.35,
      z: 1,
      cleared: false,
      blocks: ["hedge-trimmer"],
      label: "Thick entangled wood in the hedge",
    };
    // Clear stone so only hardwood remains
    raw.hazards["lawn-stone-1"] = {
      ...raw.hazards["lawn-stone-1"],
      cleared: true,
    };
    const migrated = migrateGardenDomain(raw);
    expect(migrated.hazards["hedge-hardwood-1"].requiredForReview).toBe(false);
    const summary = buildReviewSummary(migrated);
    expect(summary.unresolvedHazards).toBe(0);
  });

  it("fixture version bumped for A/B isolation", () => {
    expect(FIXTURE_VERSION).toBe("saturday-garden-v06.3");
  });

  it("clearing the stone alone removes required hazard gate", () => {
    const g = () => useGameStore.getState();
    g().inspectObject("lawn-stone-1");
    g().removeHazard("lawn-stone-1");
    const summary = buildReviewSummary(g().work.garden!);
    expect(summary.unresolvedHazards).toBe(0);
  });
});
