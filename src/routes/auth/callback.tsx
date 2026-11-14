import { useEffect, useState, useRef } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { supabase } from "@/lib/supabase";

type CallbackSearchParams = {
  next?: string;
  error?: string;
  error_description?: string;
  code?: string;
};

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>): CallbackSearchParams => {
    return {
      next: typeof search.next === "string" ? search.next : undefined,
      error: typeof search.error === "string" ? search.error : undefined,
      error_description:
        typeof search.error_description === "string" ? search.error_description : undefined,
      code: typeof search.code === "string" ? search.code : undefined,
    };
  },
  component: AuthCallbackPage,
});

function sanitizeDestination(dest: string | null | undefined): string {
  if (!dest) return "/community";
  // Prevent redirect loops back to auth pages or root
  if (
    dest === "/" ||
    dest === "/auth" ||
    dest.startsWith("/auth/") ||
    dest === "/login" ||
    dest === "/register"
  ) {
    return "/community";
  }
  // Must be a safe internal relative path
  if (!dest.startsWith("/") || dest.startsWith("//")) {
    return "/community";
  }
  return dest;
}

function AuthCallbackPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    let mounted = true;

    const resolveDestination = (): string => {
      let storedNext: string | null = null;
      try {
        storedNext = window.sessionStorage.getItem("manzil-auth-next");
        window.sessionStorage.removeItem("manzil-auth-next");
      } catch {}

      return sanitizeDestination(storedNext || search.next);
    };

    const processAuth = async () => {
      try {
        // 1. Check for provider error in query string or URL hash
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

        const providerError =
          urlParams.get("error_description") ||
          urlParams.get("error") ||
          hashParams.get("error_description") ||
          hashParams.get("error");

        if (providerError) {
          throw new Error(decodeURIComponent(providerError.replace(/\+/g, " ")));
        }

        // 2. PKCE code exchange: if Supabase redirected with ?code=..., exchange it for a session
        const code = urlParams.get("code") || search.code;
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          if (data?.session && mounted) {
            const dest = resolveDestination();
            navigate({ to: dest, replace: true });
            return;
          }
        }

        // 3. Check for existing session (e.g. from hash tokens or already loaded)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (sessionData?.session && mounted) {
          const dest = resolveDestination();
          navigate({ to: dest, replace: true });
          return;
        }

        // 4. Subscribe to auth state changes in case background exchange is completing
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;
          if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
            const dest = resolveDestination();
            navigate({ to: dest, replace: true });
          }
        });

        // 5. Timeout fallback
        const timer = setTimeout(async () => {
          if (!mounted) return;
          const { data: finalData } = await supabase.auth.getSession();
          if (finalData?.session) {
            navigate({ to: resolveDestination(), replace: true });
          } else {
            setError("Authentication session could not be established. Please try logging in again.");
          }
        }, 5000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Failed to complete authentication");
        }
      }
    };

    void processAuth();

    return () => {
      mounted = false;
    };
  }, [navigate, search.code, search.next]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-card">
        <div className="mb-6 flex justify-center">
          <Wordmark className="text-2xl" />
        </div>

        {error ? (
          <div className="space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
              <AlertCircle className="size-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Authentication Error</h1>
              <p className="mt-1 text-xs text-muted-foreground">{error}</p>
            </div>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-xs font-bold text-background transition-opacity hover:opacity-90"
            >
              <span>Back to sign in</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface">
              <Loader2 className="size-6 animate-spin text-forest" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Completing sign in…</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Connecting your account with Manzil
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
