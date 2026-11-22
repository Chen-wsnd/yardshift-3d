/** Pure identity check — must match GardenToolView mounting rules. */
export function toolPresentationKind(
  toolId: string,
): "kit" | "silhouette-edger" | "silhouette-weeder" | "fallback" {
  if (toolId === "hand-edger") return "silhouette-edger";
  if (toolId === "hand-weeder") return "silhouette-weeder";
  const kit = new Set([
    "hand-hedge-shears",
    "hedge-trimmer",
    "rake",
    "leaf-blower",
    "bag",
    "string-trimmer",
  ]);
  if (kit.has(toolId)) return "kit";
  return "fallback";
}
