/**
 * Presentational asset roles — independent of game rules / tool IDs.
 */

export type VisualRole =
  | "ground_grass"
  | "long_lawn_dirty"
  | "long_lawn_clean"
  | "lawn_edge_dirty"
  | "lawn_edge_clean"
  | "weeds_dirty"
  | "weeds_clean"
  | "tall_edge_grass_dirty"
  | "tall_edge_grass_clean"
  | "leaves_dirty"
  | "hedge_dirty"
  | "hedge_clean"
  | "fallen_branch_dirty"
  | "decor_tree"
  | "decor_bush"
  | "decor_path"
  | "decor_planter";

export type AssetSourceKind = "texture" | "glb" | "procedural";

export interface YardAssetEntry {
  role: VisualRole;
  kind: AssetSourceKind;
  /** Public URL path when kind is texture/glb */
  path?: string;
  fallback: "procedural";
  sourceName: string;
  sourceUrl: string;
  license: string;
  notes?: string;
}
