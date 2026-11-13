import { Link } from "@tanstack/react-router";
import { ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Place } from "@/domain/types";
import { useT } from "@/state/preferences";

/** Linked-place chip: always opens the exact place. Shows the post → place connection. */
export function PlaceChip({ place, className }: { place: Place; className?: string }) {
  const t = useT();
  const hood = place.neighborhood ? t(`hood.${place.neighborhood}`) : t("common.tashkent");
  return (
    <Link
      to="/places/$placeId"
      params={{ placeId: place.id }}
      className={cn(
        "group inline-flex max-w-full items-center gap-2.5 rounded-xl border border-border bg-surface py-1.5 pl-1.5 pr-3 text-left transition-[border-color,background-color,box-shadow] duration-200 hover:border-forest hover:bg-signal-soft focus-visible:border-forest",
        className,
      )}
    >
      {place.coverImage ? (
        <img src={place.coverImage} alt="" loading="lazy" width={64} height={64} className="size-8 shrink-0 rounded-lg object-cover" />
      ) : (
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-forest">
          <MapPin className="size-4" aria-hidden />
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-bold leading-tight text-foreground">{place.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {t(`cat.${place.categories[0] ?? "food"}`)} · {hood}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-forest" aria-hidden />
    </Link>
  );
}
