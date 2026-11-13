import type { NeighborhoodId, PlaceCategory } from "@/domain/types";

export type DiscoverSearch = {
  q?: string;
  cat?: PlaceCategory;
  hood?: NeighborhoodId;
  view?: "grid" | "list";
};

const KEY = "manzil.discover-last.v1";

/** Remembers the last Discover filters for this tab so "Back to Discover" restores them. */
export function rememberDiscover(search: DiscoverSearch) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(search));
  } catch {
    /* storage unavailable: ignore */
  }
}

export function recallDiscover(): DiscoverSearch {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DiscoverSearch) : {};
  } catch {
    return {};
  }
}
