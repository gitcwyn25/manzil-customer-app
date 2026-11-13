import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Locale, NeighborhoodId, PlaceCategory, ThemePref } from "@/domain/types";
import { isNeighborhood } from "@/domain/filters";
import { localeTags, translate, type MessageKey } from "@/i18n";

export type Preferences = {
  theme: ThemePref;
  locale: Locale;
  neighborhood: NeighborhoodId | "all";
  interests: PlaceCategory[];
};

const PREFS_KEY = "manzil.prefs.v1";
const defaults: Preferences = { theme: "light", locale: "en", neighborhood: "all", interests: [] };

type PrefsContextValue = {
  prefs: Preferences;
  setPrefs: (patch: Partial<Preferences>) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const PrefsContext = createContext<PrefsContextValue | null>(null);

function parsePrefs(raw: string | null): Preferences {
  if (!raw) return defaults;
  try {
    const p = JSON.parse(raw) as Partial<Preferences>;
    return {
      theme: p.theme === "dark" || p.theme === "system" ? p.theme : "light",
      locale: p.locale === "uz" || p.locale === "ru" ? p.locale : "en",
      neighborhood: isNeighborhood(p.neighborhood) ? p.neighborhood : "all",
      interests: Array.isArray(p.interests) ? p.interests : [],
    };
  } catch {
    return defaults;
  }
}

function applyTheme(theme: ThemePref) {
  const dark =
    theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setState] = useState<Preferences>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(parsePrefs(window.localStorage.getItem(PREFS_KEY)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    applyTheme(prefs.theme);
    document.documentElement.lang = localeTags[prefs.locale];
    if (prefs.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [prefs, ready]);

  const setPrefs = useCallback((patch: Partial<Preferences>) => setState((p) => ({ ...p, ...patch })), []);
  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => translate(prefs.locale, key, vars),
    [prefs.locale],
  );

  const value = useMemo(() => ({ prefs, setPrefs, t }), [prefs, setPrefs, t]);
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used inside PreferencesProvider");
  return ctx;
}

export const useT = () => usePrefs().t;

/** Inline pre-hydration script: applies the saved theme before paint to avoid a flash. */
export const themeBootScript = `try{var p=JSON.parse(localStorage.getItem("${PREFS_KEY}")||"{}");var d=p.theme==="dark"||(p.theme==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}`;
