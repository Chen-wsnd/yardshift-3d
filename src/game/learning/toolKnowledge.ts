/**
 * Display-only tool judgment copy. Numeric capability stays in equipmentProfiles.
 * Do not invent a second conflicting spec for coverage/drain/work rates.
 */

export interface ToolKnowledge {
  toolId: string;
  purpose: string;
  bestFor: string[];
  limitation: string;
  preflight: string[];
  effectToWatch: string;
  contrastToolIds: string[];
  realismNote?: string;
  sourceIds?: string[];
}

export const FIXTURE_VERSION = "saturday-garden-v06.2";

const KNOWLEDGE: Record<string, ToolKnowledge> = {
  "manual-reel-mower": {
    toolId: "manual-reel-mower",
    purpose: "Cut open grass with a narrow forward-driven reel.",
    bestFor: ["Controlled passes", "Working carefully near flower borders"],
    limitation: "Barely cuts in reverse; slow on large open lawn.",
    preflight: ["Clear stones in the pass", "Plan a forward path"],
    effectToWatch: "A narrow cut strip appears only while you push forward.",
    contrastToolIds: ["lawn-mower", "hand-edger"],
    realismNote: "Width and effort are game-modeled, not manufacturer specs.",
    sourceIds: ["umass-lawn-mowing", "ccohs-rotary"],
  },
  "lawn-mower": {
    toolId: "lawn-mower",
    purpose: "Cover larger lawn area with a wider powered deck.",
    bestFor: ["Open grass", "Faster coverage when battery is ready"],
    limitation: "Needs battery; wider cut is less precise near ornamentals.",
    preflight: ["Check battery", "Inspect for stones before spinning blades"],
    effectToWatch: "Wider cut path; battery drops with real travel distance.",
    contrastToolIds: ["manual-reel-mower", "hand-edger"],
    realismNote: "Battery drain is simulated for learning, not a real pack curve.",
    sourceIds: ["ccohs-rotary"],
  },
  "hand-hedge-shears": {
    toolId: "hand-hedge-shears",
    purpose: "Shape soft hedge growth in a small, controlled bite.",
    bestFor: ["Short soft shoots", "Precise outline work"],
    limitation: "Slow on long runs; not for thick hardwood.",
    preflight: ["Confirm growth is soft enough", "Watch for entanglement"],
    effectToWatch: "One cluster trims; clippings fall under that face.",
    contrastToolIds: ["hedge-trimmer"],
    sourceIds: ["rhs-hedge-trim"],
  },
  "hedge-trimmer": {
    toolId: "hedge-trimmer",
    purpose: "Form longer hedge faces faster with a powered bar.",
    bestFor: ["Long east-hedge runs", "When battery is charged"],
    limitation: "Hard wood can block the bar; overcutting leaves lasting notches.",
    preflight: ["Clear hardwood hazards nearby", "Check battery"],
    effectToWatch: "Faster cluster cuts; clippings land on the ground below.",
    contrastToolIds: ["hand-hedge-shears"],
    sourceIds: ["rhs-hedge-trim"],
  },
  "hand-edger": {
    toolId: "hand-edger",
    purpose: "Neaten the vertical path–lawn edge strip.",
    bestFor: ["Path edges after mowing", "Controlled narrow work"],
    limitation: "Does not replace open-lawn mowing; slower than powered trim.",
    preflight: ["Stay on the edge strip", "Do not treat this as a mower"],
    effectToWatch: "Independent edge segments tidy without changing lawn %.",
    contrastToolIds: ["string-trimmer", "lawn-mower"],
  },
  "string-trimmer": {
    toolId: "string-trimmer",
    purpose: "Cut weed tops or speed along edges with a spinning line.",
    bestFor: ["Quick top control", "Path edges when careful"],
    limitation: "Does not remove roots; easy to nick flowers; needs battery.",
    preflight: ["Identify weeds vs ornamentals", "Check battery"],
    effectToWatch: "Tops shrink; roots remain until a proper pull.",
    contrastToolIds: ["hand-weeder", "hand-edger"],
    sourceIds: ["umd-weeds", "ucipm-string"],
  },
  "hand-weeder": {
    toolId: "hand-weeder",
    purpose: "Pull selected weeds including underground structure.",
    bestFor: ["Weeds you need gone", "Working beside ornamentals carefully"],
    limitation: "Slower; mistaking a flower leaves lasting damage.",
    preflight: ["Confirm it is a weed", "Brace nearby flowers"],
    effectToWatch: "Root removed; pulled material becomes debris to clean.",
    contrastToolIds: ["string-trimmer"],
    sourceIds: ["umd-weeds"],
  },
  rake: {
    toolId: "rake",
    purpose: "Gather scattered leaves and clippings into piles.",
    bestFor: ["Local control", "Preparing piles for bagging"],
    limitation: "Does not bag or remove material by itself.",
    preflight: ["Work near the debris", "Decide pile location"],
    effectToWatch: "Scattered bits cluster into gathered piles.",
    contrastToolIds: ["leaf-blower", "bag"],
    realismNote: "This visit asks you to collect these leaves — bagging is not the only real-world option.",
    sourceIds: ["isu-leaves"],
  },
  "leaf-blower": {
    toolId: "leaf-blower",
    purpose: "Push light debris along a chosen direction.",
    bestFor: ["Moving scattered leaves quickly", "Herding toward a pile"],
    limitation: "Can scatter already-gathered piles; drains battery.",
    preflight: ["Aim toward a pile site", "Check battery"],
    effectToWatch: "Debris slides in the blow direction within a real radius.",
    contrastToolIds: ["rake", "bag"],
    sourceIds: ["isu-leaves"],
  },
  bag: {
    toolId: "bag",
    purpose: "Remove gathered piles from the working surface.",
    bestFor: ["Finishing cleanup after rake/blow", "Clearing local piles"],
    limitation: "Only bags nearby gathered piles — not distant scattered bits.",
    preflight: ["Gather first", "Stand next to the pile"],
    effectToWatch: "Gathered piles disappear from the yard surface.",
    contrastToolIds: ["rake", "leaf-blower"],
    realismNote: "Composting/mulching exist in real yards; this visit tracks collection.",
    sourceIds: ["isu-leaves"],
  },
};

export function getToolKnowledge(toolId: string): ToolKnowledge | undefined {
  return KNOWLEDGE[toolId];
}

export function toolBlurb(toolId: string): string {
  const k = KNOWLEDGE[toolId];
  if (!k) return toolId;
  return `${k.purpose} Limit: ${k.limitation}`;
}

/** Short contrast line for confirm UI. */
export function toolContrastLine(toolIds: string[]): string {
  const parts = toolIds
    .map((id) => {
      const k = KNOWLEDGE[id];
      if (!k) return null;
      return `${id}: good for ${k.bestFor[0]?.toLowerCase() ?? "this work"}; ${k.limitation}`;
    })
    .filter(Boolean);
  return parts.slice(0, 3).join(" · ");
}
