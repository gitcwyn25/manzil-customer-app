import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FlaskConical, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { useAuth } from "@/state/auth";
import { useT } from "@/state/preferences";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const t = useT();
  const navigate = useNavigate();
  const { resetPasswordForEmail, startDemo } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const { error } = await resetPasswordForEmail(email);
      if (error) {
        setErrorMessage(error.message);
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleStartDemo = () => {
    startDemo();
    navigate({ to: "/community" });
  };

  return (
    <div className="flex min-h-dvh flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <Link to="/community" aria-label="Manzil" className="rounded-lg">
          <Wordmark className="text-2xl" />
        </Link>
        <button
          type="button"
          onClick={handleStartDemo}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-forest shadow-xs hover:bg-surface transition-colors"
        >
          <span>{t("auth.exploreDemo")}</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>

      {/* Main card */}
      <div className="mx-auto my-8 w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {t("auth.forgotTitle")}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {t("auth.forgotBody")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {submitted && (
              <div className="rounded-xl border border-forest/30 bg-signal-soft/40 p-3 text-xs text-foreground">
                <span className="font-bold text-forest block mb-1">
                  Reset link sent!
                </span>
                <span>
                  If an account exists for {email}, a recovery link has been sent to your inbox.
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {t("auth.email")}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.uz"
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:border-forest focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              <span>{t("auth.sendLink")}</span>
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
              >
                <ArrowLeft className="size-3.5" />
                <span>{t("auth.backToLogin")}</span>
              </Link>
            </div>
          </form>

          {/* Explore Demo action */}
          <div className="mt-6 border-t border-border pt-6 text-center">
            <button
              type="button"
              onClick={handleStartDemo}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-signal py-2.5 px-4 text-xs sm:text-sm font-bold text-signal-foreground transition-all hover:bg-signal/90 shadow-sm"
            >
              <FlaskConical className="size-4" />
              <span>{t("auth.exploreDemo")}</span>
            </button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {t("auth.exploreDemoBody")}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mx-auto w-full max-w-md text-center text-[11px] text-muted-foreground">
        <span>Manzil · {t("auth.tagline")}</span>
      </div>
    </div>
  );
}
