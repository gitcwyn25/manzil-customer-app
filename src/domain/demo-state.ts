import type { Comment, CommunityPost, ContentKind, Media, NeighborhoodId } from "./types";
import { ME_ID } from "./types";

/**
 * Local demo state. Only harmless, non-sensitive UI actions live here.
 * Never store passwords, tokens or personal data in this structure.
 */
export type DemoProfile = {
  displayName: string;
  bio: string;
  neighborhood?: NeighborhoodId | undefined;
};

export type DemoState = {
  version: 1;
  liked: string[];
  savedPosts: string[];
  savedPlaces: string[];
  following: string[];
  hidden: string[];
  userPosts: CommunityPost[];
  userComments: Comment[];
  readNotifications: string[];
  profile: DemoProfile;
};

export type NewPostInput = {
  kind: ContentKind;
  title?: string | undefined;
  text: string;
  placeId?: string | undefined;
  neighborhood?: NeighborhoodId | undefined;
  media?: Media[] | undefined;
};

export type DemoAction =
  | { type: "hydrate"; state: DemoState }
  | { type: "toggleLike"; postId: string }
  | { type: "toggleSavePost"; postId: string }
  | { type: "toggleSavePlace"; placeId: string }
  | { type: "toggleFollow"; personId: string }
  | { type: "hide"; postId: string }
  | { type: "unhide"; postId: string }
  | { type: "createPost"; id: string; createdAt: string; input: NewPostInput }
  | { type: "updatePost"; id: string; updatedAt: string; input: NewPostInput }
  | { type: "deletePost"; id: string }
  | { type: "addComment"; id: string; postId: string; text: string; createdAt: string }
  | { type: "markRead"; id: string }
  | { type: "markAllRead"; ids: string[] }
  | { type: "updateProfile"; profile: DemoProfile }
  | { type: "reset"; initial: DemoState };

export const MAX_POST_LENGTH = 1000;
export const MAX_COMMENT_LENGTH = 500;

const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

export function createInitialDemoState(initialFollowing: string[]): DemoState {
  return {
    version: 1,
    liked: [],
    savedPosts: [],
    savedPlaces: [],
    following: [...initialFollowing],
    hidden: [],
    userPosts: [],
    userComments: [],
    readNotifications: [],
    profile: { displayName: "Demo Visitor", bio: "Exploring Manzil's preview." },
  };
}

export type ValidationError = "empty" | "tooLong" | "placeRequired";

export function validatePostInput(input: NewPostInput): ValidationError | null {
  const text = input.text.trim();
  if (!text) return "empty";
  if (text.length > MAX_POST_LENGTH) return "tooLong";
  if (input.kind === "experience" && !input.placeId) return "placeRequired";
  return null;
}

function buildPost(id: string, createdAt: string, input: NewPostInput): CommunityPost {
  return {
    id,
    authorId: ME_ID,
    kind: input.kind,
    title: input.title?.trim() || undefined,
    text: input.text.trim(),
    createdAt,
    placeId: input.placeId,
    neighborhood: input.neighborhood,
    media: input.media,
    isLocal: true,
  };
}

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "toggleLike":
      return { ...state, liked: toggle(state.liked, action.postId) };
    case "toggleSavePost":
      return { ...state, savedPosts: toggle(state.savedPosts, action.postId) };
    case "toggleSavePlace":
      return { ...state, savedPlaces: toggle(state.savedPlaces, action.placeId) };
    case "toggleFollow":
      if (action.personId === ME_ID) return state;
      return { ...state, following: toggle(state.following, action.personId) };
    case "hide":
      return state.hidden.includes(action.postId)
        ? state
        : { ...state, hidden: [...state.hidden, action.postId] };
    case "unhide":
      return { ...state, hidden: state.hidden.filter((x) => x !== action.postId) };
    case "createPost":
      if (validatePostInput(action.input)) return state;
      return { ...state, userPosts: [buildPost(action.id, action.createdAt, action.input), ...state.userPosts] };
    case "updatePost": {
      if (validatePostInput(action.input)) return state;
      return {
        ...state,
        userPosts: state.userPosts.map((p) =>
          p.id === action.id
            ? { ...buildPost(p.id, p.createdAt, action.input), updatedAt: action.updatedAt }
            : p,
        ),
      };
    }
    case "deletePost":
      return {
        ...state,
        userPosts: state.userPosts.filter((p) => p.id !== action.id),
        userComments: state.userComments.filter((c) => c.postId !== action.id),
        savedPosts: state.savedPosts.filter((x) => x !== action.id),
        liked: state.liked.filter((x) => x !== action.id),
      };
    case "addComment": {
      const text = action.text.trim();
      if (!text || text.length > MAX_COMMENT_LENGTH) return state;
      return {
        ...state,
        userComments: [
          ...state.userComments,
          { id: action.id, postId: action.postId, authorId: ME_ID, text, createdAt: action.createdAt, isLocal: true },
        ],
      };
    }
    case "markRead":
      return state.readNotifications.includes(action.id)
        ? state
        : { ...state, readNotifications: [...state.readNotifications, action.id] };
    case "markAllRead":
      return { ...state, readNotifications: Array.from(new Set([...state.readNotifications, ...action.ids])) };
    case "updateProfile":
      return {
        ...state,
        profile: {
          displayName: action.profile.displayName.trim().slice(0, 40) || state.profile.displayName,
          bio: action.profile.bio.trim().slice(0, 160),
          neighborhood: action.profile.neighborhood,
        },
      };
    case "reset":
      return action.initial;
  }
}

/** Defensive parse of persisted state; returns null when shape is unexpected. */
export function parseDemoState(raw: string | null): DemoState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<DemoState>;
    if (data.version !== 1 || !Array.isArray(data.liked) || !Array.isArray(data.userPosts)) return null;
    return data as DemoState;
  } catch {
    return null;
  }
}
