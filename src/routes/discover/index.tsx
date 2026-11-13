import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MapPin, LayoutGrid, List, Map, Bookmark, X } from "lucide-react";
import { ContentColumn } from "@/components/navigation/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { useDemo } from "@/state/demo-store";
import { usePrefs, useT } from "@/state/preferences";
import { filterPlaces } from "@/domain/filters";
import type { PlaceCategory, NeighborhoodId, Place } from "@/domain/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/discover/")({
  component: DiscoverPage,
});

function DiscoverPage() {
  const t = useT();
  const { places, state, dispatch, guard } = useDemo();
  const { prefs, setPrefs } = usePrefs();

  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<PlaceCategory | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories: Array<{ key: PlaceCategory | "all"; label: string }> = [
    { key: "all", label: t("cat.all") },
    { key: "food", label: t("cat.food") },
    { key: "coffee", label: t("cat.coffee") },
    { key: "work", label: t("cat.work") },
    { key: "family", label: t("cat.family") },
    { key: "parks", label: t("cat.parks") },
    { key: "shopping", label: t("cat.shopping") },
    { key: "services", label: t("cat.services") },
  ];

  const neighborhoods: Array<{ id: NeighborhoodId | "all"; label: string }> = [
    { id: "all", label: t("common.allTashkent") },
    { id: "yunusabad", label: t("hood.yunusabad") },
    { id: "chilonzor", label: t("hood.chilonzor") },
    { id: "mirzo-ulugbek", label: t("hood.mirzo-ulugbek") },
    { id: "shaykhontohur", label: t("hood.shaykhontohur") },
    { id: "mirobod", label: t("hood.mirobod") },
  ];

  const filteredPlaces = useMemo(() => {
    return filterPlaces(places, {
      q: query,
      cat: selectedCat === "all" ? undefined : selectedCat,
      hood: prefs.neighborhood === "all" ? undefined : prefs.neighborhood,
      labelsFor: (p) => [
        t(`hood.${p.neighborhood ?? "yunusabad"}`),
        ...p.categories.map((c) => t(`cat.${c}`)),
      ],
    });
  }, [places, query, selectedCat, prefs.neighborhood, t]);

  const handleToggleSave = (e: React.MouseEvent, placeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    guard(() => dispatch({ type: "toggleSavePlace", placeId }));
  };

  return (
    <ContentColumn wide>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={t("discover.title")}
          subtitle={t("discover.subtitle")}
          actions={
            <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === "grid" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
                aria-label={t("discover.viewGrid")}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  viewMode === "list" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
                aria-label={t("discover.viewList")}
              >
                <List className="size-4" />
              </button>
            </div>
          }
        />

        {/* Search input bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("discover.search")}
            className="w-full rounded-2xl border border-border bg-card py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-forest focus:outline-none shadow-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Filter row: Neighborhood select + Category chips */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
              <MapPin className="size-3.5 text-forest" />
              <select
                value={prefs.neighborhood}
                onChange={(e) => setPrefs({ neighborhood: e.target.value as NeighborhoodId | "all" })}
                className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
              >
                {neighborhoods.map((n) => (
                  <option key={n.id} value={n.id} className="bg-card text-foreground">
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-muted-foreground">
              {filteredPlaces.length} {t("common.demo").toLowerCase()} places
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {categories.map((c) => {
              const active = selectedCat === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelectedCat(c.key)}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                    active
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-forest/40 hover:text-foreground",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Informative future map placeholder as per spec */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Map className="size-4 text-forest" />
            <span>{t("discover.mapLater")}</span>
          </div>
          <span className="rounded bg-card px-1.5 py-0.5 text-[10px] font-mono border border-border">
            V2 Preview
          </span>
        </div>

        {/* Places List / Grid */}
        {filteredPlaces.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "flex flex-col gap-3"
            }
          >
            {filteredPlaces.map((place) => {
              const saved = state.savedPlaces.includes(place.id);
              const hood = place.neighborhood ? t(`hood.${place.neighborhood}`) : t("common.tashkent");

              if (viewMode === "list") {
                return (
                  <Link
                    key={place.id}
                    to="/places/$placeId"
                    params={{ placeId: place.id }}
                    className="group flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-border bg-card p-3.5 shadow-card transition-all hover:border-forest/40"
                  >
                    <div className="relative h-32 w-full sm:w-44 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
                      {place.coverImage ? (
                        <img
                          src={place.coverImage}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-forest">
                          <MapPin className="size-6" />
                        </div>
                      )}
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-foreground/80 px-1.5 py-0.5 text-[9px] font-bold text-background backdrop-blur-sm">
                        {t("common.demo")}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-between h-full min-w-0 py-0.5">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-forest">
                            {t(`cat.${place.categories[0] ?? "food"}`)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleToggleSave(e, place.id)}
                            className={cn(
                              "p-1.5 rounded-lg border transition-colors",
                              saved ? "bg-signal-soft border-forest/30 text-forest" : "bg-card text-muted-foreground border-border hover:text-foreground",
                            )}
                            aria-label={saved ? t("action.saved") : t("action.save")}
                          >
                            <Bookmark className={cn("size-3.5", saved && "fill-forest")} />
                          </button>
                        </div>
                        <h2 className="text-base font-bold text-foreground group-hover:text-forest transition-colors truncate">
                          {place.name}
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {place.summary}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="size-3 text-forest" />
                          <span>{hood}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={place.id}
                  to="/places/$placeId"
                  params={{ placeId: place.id }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:border-forest/40 hover:shadow-elevated"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-surface">
                    {place.coverImage ? (
                      <img
                        src={place.coverImage}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-forest">
                        <MapPin className="size-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    <div className="absolute left-2.5 top-2.5 right-2.5 flex items-center justify-between">
                      <span className="rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-bold text-foreground backdrop-blur-sm">
                        {t(`cat.${place.categories[0] ?? "food"}`)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(e, place.id)}
                        className={cn(
                          "p-1.5 rounded-full backdrop-blur-md transition-all",
                          saved ? "bg-signal text-signal-foreground shadow-md" : "bg-black/40 text-white hover:bg-black/70",
                        )}
                        aria-label={saved ? t("action.saved") : t("action.save")}
                      >
                        <Bookmark className={cn("size-3.5", saved && "fill-current")} />
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1 font-semibold drop-shadow-sm">
                        <MapPin className="size-3 text-signal" />
                        <span className="truncate">{hood}</span>
                      </span>
                      <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-signal">
                        {t("common.demo")}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-foreground group-hover:text-forest transition-colors truncate">
                        {place.name}
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {place.summary}
                      </p>
                    </div>

                    {place.features && place.features.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {place.features.slice(0, 2).map((feat) => (
                          <span
                            key={feat}
                            className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground truncate"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title={t("discover.noMatch")}
            body={t("discover.noMatchBody")}
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedCat("all");
                  setPrefs({ neighborhood: "all" });
                }}
                className="rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-forest/90"
              >
                {t("common.clearFilters")}
              </button>
            }
          />
        )}
      </div>
    </ContentColumn>
  );
}
