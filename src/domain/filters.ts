import type {
  CommunityPost,
  FeedChip,
  FeedTab,
  NeighborhoodId,
  Place,
  PlaceCategory,
} from "./types";

export type FeedFilterInput = {
  tab: FeedTab;
  chip: FeedChip;
  following: readonly string[];
  hidden: readonly string[];
  neighborhood: NeighborhoodId | "all";
  query?: string;
  placesById: ReadonlyMap<string, Place>;
};

const norm = (s: string) =>
  s
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u02bb\u02bc'‘’`]/g, "");

function postMatchesChip(post: CommunityPost, chip: FeedChip, place?: Place): boolean {
  switch (chip) {
    case "all":
      return true;
    case "questions":
      return post.kind === "question";
    case "experiences":
      return post.kind === "experience";
    case "food":
    case "coffee":
    case "services": {
      const cat: PlaceCategory = chip;
      return Boolean(post.tags?.includes(cat) || place?.categories.includes(cat));
    }
  }
}

/** Deterministic demo feed selection. Not a recommendation engine. */
export function filterFeed(posts: readonly CommunityPost[], input: FeedFilterInput): CommunityPost[] {
  const q = input.query ? norm(input.query.trim()) : "";
  return posts
    .filter((post) => !input.hidden.includes(post.id))
    .filter((post) => {
      if (input.tab === "following") return input.following.includes(post.authorId);
      if (input.tab === "nearby") {
        if (input.neighborhood === "all") return false;
        const place = post.placeId ? input.placesById.get(post.placeId) : undefined;
        return (post.neighborhood ?? place?.neighborhood) === input.neighborhood;
      }
      return true;
    })
    .filter((post) => {
      const place = post.placeId ? input.placesById.get(post.placeId) : undefined;
      return postMatchesChip(post, input.chip, place);
    })
    .filter((post) => {
      if (!q) return true;
      const place = post.placeId ? input.placesById.get(post.placeId) : undefined;
      return norm(`${post.title ?? ""} ${post.text} ${place?.name ?? ""}`).includes(q);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export type PlaceFilterInput = {
  q?: string;
  cat?: PlaceCategory;
  hood?: NeighborhoodId;
  /** Extra searchable labels per place (localized category + neighborhood names). */
  labelsFor?: (place: Place) => string[];
};

export function filterPlaces(places: readonly Place[], input: PlaceFilterInput): Place[] {
  const q = input.q ? norm(input.q.trim()) : "";
  return places.filter((place) => {
    if (input.cat && !place.categories.includes(input.cat)) return false;
    if (input.hood && place.neighborhood !== input.hood) return false;
    if (!q) return true;
    const haystack = norm(
      [
        place.name,
        place.summary ?? "",
        place.neighborhood ?? "",
        ...place.categories,
        ...(place.features ?? []),
        ...(input.labelsFor?.(place) ?? []),
      ].join(" "),
    );
    return q.split(/\s+/).every((term) => haystack.includes(term));
  });
}

/** Posts connected to a place, split into experiences vs. other community posts. */
export function postsForPlace(posts: readonly CommunityPost[], placeId: string, hidden: readonly string[] = []) {
  const linked = posts
    .filter((p) => p.placeId === placeId && !hidden.includes(p.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return {
    experiences: linked.filter((p) => p.kind === "experience"),
    community: linked.filter((p) => p.kind !== "experience"),
  };
}

export const NEIGHBORHOODS: NeighborhoodId[] = [
  "yunusabad",
  "chilonzor",
  "mirzo-ulugbek",
  "shaykhontohur",
  "mirobod",
];

export const PLACE_CATEGORIES: PlaceCategory[] = [
  "food",
  "coffee",
  "family",
  "work",
  "parks",
  "shopping",
  "services",
];

export const FEED_CHIPS: FeedChip[] = ["all", "questions", "experiences", "food", "coffee", "services"];
export const FEED_TABS: FeedTab[] = ["forYou", "following", "nearby"];

export const isNeighborhood = (v: unknown): v is NeighborhoodId =>
  typeof v === "string" && (NEIGHBORHOODS as string[]).includes(v);
export const isPlaceCategory = (v: unknown): v is PlaceCategory =>
  typeof v === "string" && (PLACE_CATEGORIES as string[]).includes(v);
