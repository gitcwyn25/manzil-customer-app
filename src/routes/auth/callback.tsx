import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { supabase } from "@/lib/supabase";

type CallbackSearchParams = {
  next?: string;
  error?: string;
  error_description?: string;
};

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>): CallbackSearchParams => {
    return {
      next: typeof search.next === "string" ? search.next : "/community",
      error: typeof search.error === "string" ? search.error : undefined,
      error_description:
        typeof search.error_description === "string" ? search.error_description : undefined,
    };
  },
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [error, setError] = useState<string | null>(search.error_description || search.error || null);

  useEffect(() => {
    if (error) return;

    let mounted = true;

    const processSession = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (data.session) {
          const destination = search.next || "/community";
          navigate({ to: destination });
          return;
        }

        // Also listen for auth event in case hash tokens are still exchanging
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (!mounted) return;
          if (event === "SIGNED_IN" && session) {
            const destination = search.next || "/community";
            navigate({ to: destination });
          }
        });

        // Timeout fallback if no session establishes within 5 seconds
        const timer = setTimeout(() => {
          if (mounted && !error) {
            // Check once more before declaring error
            void supabase.auth.getSession().then(({ data: finalData }) => {
              if (finalData.session) {
                navigate({ to: search.next || "/community" });
              } else {
                setError("Authentication session could not be established. Please try logging in again.");
              }
            });
          }
        }, 5000);

        return () => {
          authListener.subscription.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err: any) {
        if (mounted) setError(err.message || "Failed to complete authentication");
      }
    };

    void processSession();

    return () => {
      mounted = false;
    };
  }, [error, navigate, search.next]);

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
