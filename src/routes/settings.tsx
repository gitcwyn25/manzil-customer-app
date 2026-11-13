import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sun,
  Moon,
  Monitor,
  Globe,
  MapPin,
  RotateCcw,
  Shield,
  ExternalLink,
  Check,
  User,
  LogOut,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";
import { ContentColumn } from "@/components/navigation/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDemo } from "@/state/demo-store";
import { useAuth } from "@/state/auth";
import { usePrefs, useT } from "@/state/preferences";
import type { Locale, NeighborhoodId, ThemePref } from "@/domain/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const t = useT();
  const { status, user, endDemo, signOut } = useAuth();
  const { reset } = useDemo();
  const { prefs, setPrefs } = usePrefs();

  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleReset = () => {
    reset();
    setResetDialogOpen(false);
    toast.success(t("settings.resetDone"));
  };

  const themes: Array<{ key: ThemePref; label: string; icon: typeof Sun }> = [
    { key: "light", label: t("theme.light"), icon: Sun },
    { key: "dark", label: t("theme.dark"), icon: Moon },
    { key: "system", label: t("theme.system"), icon: Monitor },
  ];

  const locales: Array<{ key: Locale; label: string; sub: string }> = [
    { key: "en", label: "English", sub: "Global English" },
    { key: "uz", label: "Oʻzbekcha", sub: "Lotin yozuvi" },
    { key: "ru", label: "Русский", sub: "Русский язык" },
  ];

  const neighborhoods: Array<{ id: NeighborhoodId | "all"; label: string }> = [
    { id: "all", label: t("common.allTashkent") },
    { id: "yunusabad", label: t("hood.yunusabad") },
    { id: "chilonzor", label: t("hood.chilonzor") },
    { id: "mirzo-ulugbek", label: t("hood.mirzo-ulugbek") },
    { id: "shaykhontohur", label: t("hood.shaykhontohur") },
    { id: "mirobod", label: t("hood.mirobod") },
  ];

  return (
    <ContentColumn>
      <div className="space-y-6">
        <PageHeader title={t("settings.title")} />

        {/* Account / Session status */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2">
            <User className="size-4 text-forest" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("settings.account")}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {status === "authenticated"
              ? `Signed in as ${user?.name || user?.email || "User"}${user?.email ? ` (${user.email})` : ""}. Connected with ${user?.provider || "Supabase"}.`
              : status === "demo"
              ? t("settings.accountDemo")
              : t("settings.accountSignedOut")}
          </p>
          <div className="pt-1">
            {status === "authenticated" ? (
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-card transition-colors shadow-xs"
              >
                <LogOut className="size-3.5" />
                <span>Sign out</span>
              </button>
            ) : status === "demo" ? (
              <button
                type="button"
                onClick={endDemo}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-card transition-colors shadow-xs"
              >
                <LogOut className="size-3.5" />
                <span>{t("settings.endDemo")}</span>
              </button>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-forest/90"
              >
                <LogIn className="size-3.5" />
                <span>{t("settings.signIn")}</span>
              </Link>
            )}
          </div>
        </section>

        {/* Appearance Section */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("settings.appearance")}
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            {themes.map((th) => {
              const Icon = th.icon;
              const active = prefs.theme === th.key;
              return (
                <button
                  key={th.key}
                  type="button"
                  onClick={() => setPrefs({ theme: th.key })}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all",
                    active
                      ? "border-forest bg-signal-soft text-foreground shadow-xs font-extrabold"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className={cn("size-4", active && "text-forest")} />
                  <span>{th.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Language Section */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-forest" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("settings.language")}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("settings.languageNote")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {locales.map((loc) => {
              const active = prefs.locale === loc.key;
              return (
                <button
                  key={loc.key}
                  type="button"
                  onClick={() => setPrefs({ locale: loc.key })}
                  className={cn(
                    "flex flex-col rounded-xl border p-3 text-left transition-all",
                    active
                      ? "border-forest bg-signal-soft text-foreground shadow-xs font-bold"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="text-xs font-bold">{loc.label}</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">{loc.sub}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Location Preferences */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-forest" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("settings.location")}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("settings.locationBody")}
          </p>
          <div className="max-w-xs">
            <select
              value={prefs.neighborhood}
              onChange={(e) => setPrefs({ neighborhood: e.target.value as any })}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground focus:border-forest focus:outline-none cursor-pointer"
            >
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Demo Controls */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2">
            <RotateCcw className="size-4 text-forest" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("settings.demo")}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("settings.demoBody")}
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setResetDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-card transition-colors shadow-xs"
            >
              <RotateCcw className="size-3.5 text-forest" />
              <span>{t("settings.reset")}</span>
            </button>
          </div>
        </section>

        {/* Privacy & Safety */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-forest" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("settings.privacy")}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("settings.privacyBody")}
          </p>
        </section>

        {/* External Links */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("settings.about")}
          </h2>
          <div className="space-y-2">
            <a
              href="https://manzilgroup.uz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-xs font-semibold text-foreground hover:border-forest/40 transition-colors"
            >
              <span>{t("settings.website")}</span>
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </a>
            <div className="rounded-xl border border-border bg-surface/60 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground block mb-0.5">{t("nav.forBusinesses")}</span>
              <span>{t("settings.businessNote")}</span>
            </div>
          </div>
        </section>

        {/* Reset Confirmation Dialog */}
        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("settings.resetConfirm")}</AlertDialogTitle>
              <AlertDialogDescription>{t("settings.resetBody")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("settings.reset")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ContentColumn>
  );
}
