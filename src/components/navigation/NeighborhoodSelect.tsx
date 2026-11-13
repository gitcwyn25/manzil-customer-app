import { MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NEIGHBORHOODS, isNeighborhood } from "@/domain/filters";
import { usePrefs } from "@/state/preferences";
import { cn } from "@/lib/utils";

/** Manual neighborhood preference. Never requests geolocation. */
export function NeighborhoodSelect({ className, label }: { className?: string; label?: string }) {
  const { prefs, setPrefs, t } = usePrefs();
  return (
    <Select
      value={prefs.neighborhood}
      onValueChange={(v) => setPrefs({ neighborhood: isNeighborhood(v) ? v : "all" })}
    >
      <SelectTrigger aria-label={label ?? t("discover.neighborhood")} className={cn("h-10 rounded-xl bg-card", className)}>
        <MapPin className="size-4 text-forest" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="all">{t("common.allTashkent")}</SelectItem>
        {NEIGHBORHOODS.map((h) => (
          <SelectItem key={h} value={h}>
            {t(`hood.${h}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
