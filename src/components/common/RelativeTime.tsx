import { useEffect, useState } from "react";
import { absoluteTime, relativeTime } from "@/i18n";
import { usePrefs } from "@/state/preferences";

export function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const { prefs } = usePrefs();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);
  const label = now === null ? absoluteTime(prefs.locale, iso) : relativeTime(prefs.locale, iso, now);
  return (
    <time dateTime={iso} title={absoluteTime(prefs.locale, iso)} className={className} suppressHydrationWarning>
      {label}
    </time>
  );
}
