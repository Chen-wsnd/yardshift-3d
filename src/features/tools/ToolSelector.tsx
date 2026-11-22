"use client";

import { useGameStore } from "@/game/store/gameStore";

export function ToolSelector() {
  const tools = useGameStore((state) => state.tools);
  const ownedToolIds = useGameStore((state) => state.player.ownedToolIds);
  const selectedToolId = useGameStore((state) => state.progress.selectedToolId);
  const selectTool = useGameStore((state) => state.selectTool);

  const ownedTools = tools.filter((tool) => ownedToolIds.includes(tool.id));
  const selected = ownedTools.find((tool) => tool.id === selectedToolId);

  return (
    <aside
      className="flex w-full flex-col gap-3 border-t border-stone-200 bg-white/90 p-4 sm:max-w-xs sm:border-l sm:border-t-0"
      aria-label="Tool selection"
    >
      <h2 className="font-[family-name:var(--font-display)] text-lg text-stone-900">
        Tools
      </h2>
      <p className="text-xs text-stone-500">
        Selection only in Phase 0 — interactions come later.
      </p>
      <ul className="flex flex-col gap-2">
        {ownedTools.map((tool) => {
          const selected = tool.id === selectedToolId;
          return (
            <li key={tool.id}>
              <button
                type="button"
                onClick={() => selectTool(tool.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                  selected
                    ? "bg-emerald-700 text-white"
                    : "bg-stone-100 text-stone-800 hover:bg-stone-200"
                }`}
              >
                <span className="font-medium">{tool.name}</span>
                <span
                  className={`mt-0.5 block text-xs ${selected ? "text-emerald-100" : "text-stone-500"}`}
                >
                  {tool.category}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {selected ? (
        <div className="mt-2 border-t border-stone-100 pt-3 text-sm text-stone-600">
          <p className="font-medium text-stone-800">{selected.name}</p>
          <p className="mt-1">{selected.description}</p>
          <p className="mt-2 text-xs leading-relaxed text-emerald-800/90">
            <span className="font-medium">In the real world: </span>
            {selected.realWorldPurpose}
          </p>
        </div>
      ) : null}
    </aside>
  );
}
