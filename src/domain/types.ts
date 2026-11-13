/**
 * Manzil domain model. Shapes are future-API compatible; demo data lives in src/demo.
 */
export type ContentKind = "post" | "question" | "experience";

export type PlaceCategory =
  | "food"
  | "coffee"
  | "family"
  | "work"
  | "parks"
  | "shopping"
  | "services";

export type NeighborhoodId =
  | "yunusabad"
  | "chilonzor"
  | "mirzo-ulugbek"
  | "shaykhontohur"
  | "mirobod";

export type Media = { src: string; alt: string; illustrative?: boolean } | undefined;

export type Place = {
  id: string;
  name: string;
  categories: PlaceCategory[];
  city: string;
  neighborhood?: NeighborhoodId | undefined;
  summary?: string | undefined;
  coverImage?: string | undefined;
  gallery?: Media[] | undefined;
  /** Features mentioned in demo contributions — never presented as verified facts. */
  features?: string[] | undefined;
  /** Unknown fields stay undefined and render as "Not available". */
  hours?: string | undefined;
  phone?: string | undefined;
  website?: string | undefined;
  isIllustrative?: boolean | undefined;
};

export type Person = {
  id: string;
  handle: string;
  displayName: string;
  bio?: string | undefined;
  /** Only shown when the person opted in. */
  neighborhood?: NeighborhoodId | undefined;
  avatarTone: 1 | 2 | 3 | 4 | 5;
  isDemo: true;
};

export type Sentiment = "positive" | "mixed" | "critical";

export type CommunityPost = {
  id: string;
  authorId: string;
  kind: ContentKind;
  title?: string | undefined;
  text: string;
  createdAt: string;
  updatedAt?: string | undefined;
  placeId?: string | undefined;
  neighborhood?: NeighborhoodId | undefined;
  media?: Media[] | undefined;
  tags?: string[] | undefined;
  sentiment?: Sentiment | undefined;
  /** Illustrative counts for UI density. Never genuine metrics. */
  demoCounts?: { likes: number } | undefined;
  /** True for posts created in this browser's demo session. */
  isLocal?: boolean | undefined;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: string;
  isLocal?: boolean | undefined;
};

export type NotificationKind = "reply" | "mention" | "follow" | "context";

export type DemoNotification = {
  id: string;
  kind: NotificationKind;
  actorId: string;
  createdAt: string;
  postId?: string | undefined;
  placeId?: string | undefined;
};

export type FeedTab = "forYou" | "following" | "nearby";
export type FeedChip = "all" | "questions" | "experiences" | "food" | "coffee" | "services";

export type Locale = "en" | "uz" | "ru";
export type ThemePref = "light" | "dark" | "system";

export const ME_ID = "me";
