import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createInitialDemoState,
  demoReducer,
  parseDemoState,
  type DemoAction,
  type DemoState,
  type NewPostInput,
} from "@/domain/demo-state";
import { demoInitialFollowing } from "@/demo/people";
import { demoRepository } from "@/services/content";
import type { Comment, CommunityPost, Person, Place } from "@/domain/types";
import { ME_ID } from "@/domain/types";
import { useAuth } from "./auth";

const STORE_KEY = "manzil.demo-state.v1";

type DemoStoreValue = {
  state: DemoState;
  dispatch: (action: DemoAction) => void;
  /** Runs a personal action, or asks the visitor to start the demo session first. */
  guard: (fn: () => void) => void;
  gateOpen: boolean;
  setGateOpen: (open: boolean) => void;
  createPost: (input: NewPostInput) => string;
  reset: () => void;
  // Merged read model
  posts: CommunityPost[];
  places: Place[];
  placesById: Map<string, Place>;
  people: Person[];
  personById: (id: string) => Person | undefined;
  personByHandle: (handle: string) => Person | undefined;
  commentsFor: (postId: string) => Comment[];
};

const DemoStoreContext = createContext<DemoStoreValue | null>(null);

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [state, dispatch] = useReducer(demoReducer, demoInitialFollowing, createInitialDemoState);
  const [gateOpen, setGateOpen] = useState(false);
  const hydrated = useRef(false);
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    const saved = parseDemoState(window.localStorage.getItem(STORE_KEY));
    if (saved) dispatch({ type: "hydrate", state: saved });
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }, [state]);

  // Run the action the visitor attempted right after they start the demo.
  useEffect(() => {
    if (status === "demo" && pending.current) {
      const fn = pending.current;
      pending.current = null;
      fn();
    }
  }, [status]);

  const guard = useCallback(
    (fn: () => void) => {
      if (status === "demo") fn();
      else {
        pending.current = fn;
        setGateOpen(true);
      }
    },
    [status],
  );

  const createPost = useCallback((input: NewPostInput) => {
    const id = newId("local");
    dispatch({ type: "createPost", id, createdAt: new Date().toISOString(), input });
    return id;
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "reset", initial: createInitialDemoState(demoInitialFollowing) });
  }, []);

  const readModel = useMemo(() => {
    const me: Person = {
      id: ME_ID,
      handle: "me",
      displayName: state.profile.displayName,
      bio: state.profile.bio,
      neighborhood: state.profile.neighborhood,
      avatarTone: 1,
      isDemo: true,
    };
    const people = [me, ...demoRepository.listPeople()];
    const places = demoRepository.listPlaces();
    const placesById = new Map(places.map((p) => [p.id, p]));
    const posts = [...state.userPosts, ...demoRepository.listPosts()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    const comments = [...demoRepository.listComments(), ...state.userComments];
    return {
      posts,
      places,
      placesById,
      people,
      personById: (id: string) => people.find((p) => p.id === id),
      personByHandle: (handle: string) => people.find((p) => p.handle === handle),
      commentsFor: (postId: string) =>
        comments.filter((c) => c.postId === postId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    };
  }, [state.userPosts, state.userComments, state.profile]);

  const value = useMemo<DemoStoreValue>(
    () => ({ state, dispatch, guard, gateOpen, setGateOpen, createPost, reset, ...readModel }),
    [state, guard, gateOpen, createPost, reset, readModel],
  );

  return <DemoStoreContext.Provider value={value}>{children}</DemoStoreContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) throw new Error("useDemo must be used inside DemoStoreProvider");
  return ctx;
}

export { newId };
