import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FlaskConical, ArrowRight, Loader2, Send } from "lucide-react";
import { Wordmark } from "@/components/brand/Wordmark";
import { useAuth } from "@/state/auth";
import { useT } from "@/state/preferences";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const t = useT();
  const navigate = useNavigate();
  const { status, signInWithTelegram, signInWithEmail, startDemo } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      navigate({ to: "/community", replace: true });
    }
  }, [status, navigate]);

  const handleTelegramAuth = async () => {
    setTelegramLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await signInWithTelegram("/community");
      if (error) {
        setErrorMessage(error.message);
        setTelegramLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate Telegram sign in");
      setTelegramLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      } else {
        navigate({ to: "/community" });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in");
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
              {t("auth.loginTitle")}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("auth.pitch")}
            </p>
          </div>

          {/* Telegram Sign-In Button */}
          <button
            type="button"
            disabled={telegramLoading}
            onClick={handleTelegramAuth}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#229ED9] py-2.5 px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 shadow-xs"
          >
            {telegramLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4 rotate-45" />
            )}
            <span>Continue with Telegram</span>
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {t("auth.or")} with email
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {t("auth.password")}
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-forest hover:underline">
                  {t("auth.forgot")}
                </Link>
              </div>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:border-forest focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              <span>{t("auth.login")}</span>
            </button>

            <div className="text-center text-xs text-muted-foreground pt-1">
              <span>{t("auth.noAccount")} </span>
              <Link to="/register" className="font-bold text-forest hover:underline">
                {t("auth.register")}
              </Link>
            </div>
          </form>

          {/* Prominent Explore Demo action */}
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
