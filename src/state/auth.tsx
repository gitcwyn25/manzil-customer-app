import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type AuthStatus = "demo" | "signedOut" | "authenticated";

export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  provider?: string;
};

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  supabaseUser: SupabaseUser | null;
  startDemo: () => void;
  endDemo: () => void;
  signOut: () => Promise<void>;
  signInWithTelegram: (next?: string) => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string,
    next?: string
  ) => Promise<{ error: Error | null; data?: any }>;
  resetPasswordForEmail: (email: string, next?: string) => Promise<{ error: Error | null }>;
};

const SESSION_KEY = "manzil.demo-session.v1";
const AuthContext = createContext<AuthContextValue | null>(null);

function mapSupabaseUser(user: SupabaseUser | null): AuthUser | null {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    name: meta.full_name || meta.name || user.email?.split("@")[0] || "Manzil Contributor",
    avatarUrl: meta.avatar_url || meta.picture,
    provider: user.app_metadata?.provider || (user.identities && user.identities[0]?.provider),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("signedOut");
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);

  // Initialize and listen to Supabase auth state
  useEffect(() => {
    // Check initial Supabase session
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setStatus("authenticated");
      } else if (window.localStorage.getItem(SESSION_KEY) === "demo") {
        setStatus("demo");
      }
    });

    // Subscribe to auth state updates
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setStatus("authenticated");
      } else {
        setSupabaseUser(null);
        if (window.localStorage.getItem(SESSION_KEY) === "demo") {
          setStatus("demo");
        } else {
          setStatus("signedOut");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const startDemo = useCallback(() => {
    window.localStorage.setItem(SESSION_KEY, "demo");
    setStatus("demo");
  }, []);

  const endDemo = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setStatus("signedOut");
  }, []);

  const signOut = useCallback(async () => {
    window.localStorage.removeItem(SESSION_KEY);
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setStatus("signedOut");
  }, []);

  const signInWithTelegram = useCallback(async (next = "/community") => {
    try {
      const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "https://app.manzilgroup.uz";
      const callbackUrl = `${redirectOrigin}/auth/callback?next=${encodeURIComponent(next)}`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "custom:telegram" as any,
        options: {
          redirectTo: callbackUrl,
          scopes: "openid profile",
        },
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: new Error(error.message) };
      if (data.user) {
        setSupabaseUser(data.user);
        setStatus("authenticated");
      }
      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, name?: string, next = "/community") => {
      try {
        const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "https://app.manzilgroup.uz";
        const callbackUrl = `${redirectOrigin}/auth/callback?next=${encodeURIComponent(next)}`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: callbackUrl,
          },
        });
        if (error) return { error: new Error(error.message) };
        if (data.user) {
          setSupabaseUser(data.user);
          if (data.session) setStatus("authenticated");
        }
        return { error: null, data };
      } catch (err: any) {
        return { error: err instanceof Error ? err : new Error(String(err)) };
      }
    },
    []
  );

  const resetPasswordForEmail = useCallback(async (email: string, next = "/community") => {
    try {
      const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "https://app.manzilgroup.uz";
      const callbackUrl = `${redirectOrigin}/auth/callback?next=${encodeURIComponent(next)}&flow=recovery`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: callbackUrl,
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  }, []);

  const user = useMemo(() => mapSupabaseUser(supabaseUser), [supabaseUser]);

  const value = useMemo(
    () => ({
      status,
      user,
      supabaseUser,
      startDemo,
      endDemo,
      signOut,
      signInWithTelegram,
      signInWithEmail,
      signUpWithEmail,
      resetPasswordForEmail,
    }),
    [
      status,
      user,
      supabaseUser,
      startDemo,
      endDemo,
      signOut,
      signInWithTelegram,
      signInWithEmail,
      signUpWithEmail,
      resetPasswordForEmail,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
