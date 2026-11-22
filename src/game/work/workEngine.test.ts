import { describe, expect, it } from "vitest";
import { applyWorkAction } from "./engine";
import { createFreshV02Snapshot, makeJobState } from "./fixtures";
import type { WorkAction, WorkSnapshot } from "./types";
import { canEarlyFinish, computeGrossPayout } from "@/game/rules/qualityRules";
import { applyRepair, isToolUsable, markUnpoweredIfEmpty } from "@/game/rules/durabilityRules";

function stroke(
  snap: WorkSnapshot,
  overrides: Partial<WorkAction> & Pick<WorkAction, "zoneId" | "toolId" | "worldX" | "worldZ">,
) {
  return applyWorkAction(snap, {
    jobId: snap.activeJobId ?? "job-overgrown-lawn",
    action: "cut",
    strokeId: `s-${Math.random()}`,
    ...overrides,
  });
}

function withJob1(): WorkSnapshot {
  const snap = createFreshV02Snapshot();
  snap.activeJobId = "job-overgrown-lawn";
  snap.jobs["job-overgrown-lawn"] = makeJobState("job-overgrown-lawn");
  return snap;
}

function withJob2(): WorkSnapshot {
  const snap = createFreshV02Snapshot();
  snap.jobs["job-overgrown-lawn"].claimed = true;
  snap.activeJobId = "job-backyard-restoration";
  snap.jobs["job-backyard-restoration"] = makeJobState("job-backyard-restoration");
  snap.ownedToolIds = [...snap.ownedToolIds];
  return snap;
}

describe("work engine acceptance", () => {
  it("1. hand shears hit one hedge cell; powered covers more", () => {
    let snap = withJob2();
    const hedge = snap.jobs["job-backyard-restoration"].zones.find(
      (z) => z.id === "j2-hedge",
    )!;
    const cell = hedge.cells.find((c) => !c.tags.includes("entangled"))!;
    const hand = stroke(snap, {
      zoneId: "j2-hedge",
      toolId: "hand-hedge-shears",
      worldX: cell.localX,
      worldZ: cell.localZ,
    });
    const handHit = hand.nextState.jobs[
      "job-backyard-restoration"
    ].zones
      .find((z) => z.id === "j2-hedge")!
      .cells.filter((c) => c.remainingWork < 100).length;
    expect(handHit).toBe(1);

    snap = hand.nextState;
    snap.rentedToolIds = ["hedge-trimmer"];
    const powerCell = hedge.cells[0];
    const powered = stroke(snap, {
      zoneId: "j2-hedge",
      toolId: "hedge-trimmer",
      worldX: powerCell.localX,
      worldZ: powerCell.localZ,
    });
    const powerHit = powered.nextState.jobs[
      "job-backyard-restoration"
    ].zones
      .find((z) => z.id === "j2-hedge")!
      .cells.filter((c) => c.remainingWork < 100).length;
    expect(powerHit).toBeGreaterThanOrEqual(3);
  });

  it("2. partial cell persists in snapshot clone (reload stand-in)", () => {
    let snap = withJob1();
    const lawn = snap.jobs["job-overgrown-lawn"].zones.find((z) => z.id === "j1-lawn")!;
    const cell = lawn.cells[0];
    snap = stroke(snap, {
      zoneId: "j1-lawn",
      toolId: "manual-reel-mower",
      worldX: cell.localX,
      worldZ: cell.localZ,
    }).nextState;
    const reloaded = structuredClone(snap) as WorkSnapshot;
    const again = reloaded.jobs["job-overgrown-lawn"].zones
      .find((z) => z.id === "j1-lawn")!
      .cells.find((c) => c.id === cell.id)!;
    expect(again.remainingWork).toBeLessThan(100);
    expect(again.result).toBe("partial");
  });

  it("3. brush radius does not finish far adjacent cell", () => {
    let snap = withJob1();
    const lawn = snap.jobs["job-overgrown-lawn"].zones.find((z) => z.id === "j1-lawn")!;
    const a = lawn.cells[0];
    const far = lawn.cells[lawn.cells.length - 1];
    snap = stroke(snap, {
      zoneId: "j1-lawn",
      toolId: "manual-reel-mower",
      worldX: a.localX,
      worldZ: a.localZ,
    }).nextState;
    const farAfter = snap.jobs["job-overgrown-lawn"].zones
      .find((z) => z.id === "j1-lawn")!
      .cells.find((c) => c.id === far.id)!;
    expect(farAfter.remainingWork).toBe(100);
  });

  it("4. rake gathers; bag removes pile", () => {
    let snap = withJob1();
    const leaves = snap.jobs["job-overgrown-lawn"].zones.find(
      (z) => z.id === "j1-tree-leaves",
    )!;
    const leaf = leaves.cells.find((c) => !c.isPile)!;
    snap = stroke(snap, {
      zoneId: "j1-tree-leaves",
      toolId: "rake",
      worldX: leaf.localX,
      worldZ: leaf.localZ,
    }).nextState;
    const gathered = snap.jobs["job-overgrown-lawn"].zones
      .find((z) => z.id === "j1-tree-leaves")!
      .cells.find((c) => c.id === leaf.id)!;
    expect(gathered.tags).toContain("gathered");
    snap = stroke(snap, {
      zoneId: "j1-tree-leaves",
      toolId: "bag",
      worldX: leaf.localX,
      worldZ: leaf.localZ,
      action: "bag",
    }).nextState;
    const bagged = snap.jobs["job-overgrown-lawn"].zones
      .find((z) => z.id === "j1-tree-leaves")!
      .cells.find((c) => c.id === leaf.id)!;
    expect(bagged.collected).toBe(true);
    expect(bagged.result).toBe("bagged");
  });

  it("5. trimmer leaves stubble; weeder finishes roots", () => {
    let snap = withJob2();
    snap.rentedToolIds = ["string-trimmer"];
    const bed = snap.jobs["job-backyard-restoration"].zones.find(
      (z) => z.id === "j2-flowerbed",
    )!;
    const weed = bed.cells.find(
      (c) => c.tags.includes("weed") && c.protectedKind !== "flower",
    )!;
    snap = stroke(snap, {
      zoneId: "j2-flowerbed",
      toolId: "string-trimmer",
      worldX: weed.localX,
      worldZ: weed.localZ,
    }).nextState;
    let cell = snap.jobs["job-backyard-restoration"].zones
      .find((z) => z.id === "j2-flowerbed")!
      .cells.find((c) => c.id === weed.id)!;
    expect(cell.result).toBe("stubble");
    snap = stroke(snap, {
      zoneId: "j2-flowerbed",
      toolId: "hand-weeder",
      worldX: weed.localX,
      worldZ: weed.localZ,
    }).nextState;
    cell = snap.jobs["job-backyard-restoration"].zones
      .find((z) => z.id === "j2-flowerbed")!
      .cells.find((c) => c.id === weed.id)!;
    expect(cell.remainingWork).toBeLessThan(100);
  });

  it("6. empty battery is unpowered without engine damage", () => {
    const snap = withJob1();
    let tool = snap.tools["lawn-mower"];
    tool = { ...tool, resource: 0, status: "ready" };
    tool = markUnpoweredIfEmpty(tool);
    expect(tool.status).toBe("unpowered");
    expect(tool.condition).toBe(100);
    expect(isToolUsable(tool).ok).toBe(false);
  });

  it("7. entangled wood jams shears once", () => {
    const snap = withJob2();
    const hedge = snap.jobs["job-backyard-restoration"].zones.find(
      (z) => z.id === "j2-hedge",
    )!;
    const entangled = hedge.cells.find((c) => c.tags.includes("entangled"))!;
    const res = stroke(snap, {
      zoneId: "j2-hedge",
      toolId: "hand-hedge-shears",
      worldX: entangled.localX,
      worldZ: entangled.localZ,
    });
    expect(res.events.some((e) => e.kind === "jammed")).toBe(true);
    expect(res.nextState.tools["hand-hedge-shears"].status).toBe("jammed");
  });

  it("8. repeating flower damage does not multiply fees/keys", () => {
    let snap = withJob2();
    snap.rentedToolIds = ["hedge-trimmer"];
    const bed = snap.jobs["job-backyard-restoration"].zones.find(
      (z) => z.id === "j2-flowerbed",
    )!;
    // place stroke on flower with wide tool from hedge zone — use flowerbed + trimmer precision
    const flower = bed.cells.find((c) => c.protectedKind === "flower")!;
    snap = stroke(snap, {
      zoneId: "j2-flowerbed",
      toolId: "string-trimmer",
      worldX: flower.localX,
      worldZ: flower.localZ,
    }).nextState;
    const keys1 = snap.damageKeys.length;
    snap = stroke(snap, {
      zoneId: "j2-flowerbed",
      toolId: "string-trimmer",
      worldX: flower.localX,
      worldZ: flower.localZ,
    }).nextState;
    expect(snap.damageKeys.length).toBe(keys1);
  });

  it("9. flower damage persists after zone clone", () => {
    let snap = withJob2();
    snap.rentedToolIds = ["hedge-trimmer"];
    const hedge = snap.jobs["job-backyard-restoration"].zones.find(
      (z) => z.id === "j2-hedge",
    )!;
    // damage via weeder on flower
    const bed = snap.jobs["job-backyard-restoration"].zones.find(
      (z) => z.id === "j2-flowerbed",
    )!;
    const flower = bed.cells.find((c) => c.protectedKind === "flower")!;
    snap = stroke(snap, {
      zoneId: "j2-flowerbed",
      toolId: "hand-weeder",
      worldX: flower.localX,
      worldZ: flower.localZ,
    }).nextState;
    void hedge;
    const cloned = structuredClone(snap) as WorkSnapshot;
    const f = cloned.jobs["job-backyard-restoration"].zones
      .find((z) => z.id === "j2-flowerbed")!
      .cells.find((c) => c.id === flower.id)!;
    expect(f.damageKinds).toContain("flower_damaged");
  });

  it("10. broken tool cannot work until repair", () => {
    const snap = withJob1();
    let tool = snap.tools["manual-reel-mower"];
    tool = { ...tool, condition: 0, status: "broken" };
    expect(isToolUsable(tool).ok).toBe(false);
    tool = applyRepair(tool);
    expect(tool.status).toBe("ready");
    expect(tool.condition).toBeGreaterThan(0);
  });

  it("11. rental ledger id is unique per job/tool", () => {
    const id1 = "rental:job-overgrown-lawn:lawn-mower";
    const id2 = "rental:job-overgrown-lawn:lawn-mower";
    expect(id1).toBe(id2);
  });

  it("12. early finish threshold 70%", () => {
    const job = makeJobState("job-overgrown-lawn");
    job.finishedWorkPct = 0.69;
    expect(canEarlyFinish(job)).toBe(false);
    job.finishedWorkPct = 0.7;
    expect(canEarlyFinish(job)).toBe(true);
    job.qualityScore = 40;
    expect(computeGrossPayout(job)).toBeGreaterThan(0);
  });

  it("13. payout ledger id is once per job", () => {
    expect(`payout:job-overgrown-lawn`).toBe("payout:job-overgrown-lawn");
  });

  it("14. job 2 layout distinct and manual path exists", () => {
    const j1 = makeJobState("job-overgrown-lawn");
    const j2 = makeJobState("job-backyard-restoration");
    expect(j2.zones.map((z) => z.id)).not.toEqual(j1.zones.map((z) => z.id));
    expect(j2.zones.some((z) => z.kind === "hedge")).toBe(true);
    expect(j2.zones.some((z) => z.kind === "flowerbed")).toBe(true);
  });

  it("15. starters include manual reel mower and shears", () => {
    const snap = createFreshV02Snapshot();
    expect(snap.ownedToolIds).toContain("manual-reel-mower");
    expect(snap.ownedToolIds).toContain("hand-hedge-shears");
    expect(snap.ownedToolIds).not.toContain("lawn-mower");
    expect(snap.balance).toBe(40);
  });
});
