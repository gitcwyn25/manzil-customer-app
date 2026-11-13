import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Compass, MessageSquare, MapPin } from "lucide-react";
import { ContentColumn } from "@/components/navigation/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { PostCard } from "@/components/feed/PostCard";
import { EmptyState } from "@/components/common/EmptyState";
import { useDemo } from "@/state/demo-store";
import { useT } from "@/state/preferences";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
});

function SavedPage() {
  const t = useT();
  const { posts, places, state, dispatch, guard } = useDemo();

  const [tab, setTab] = useState<"posts" | "places">("posts");

  const savedPosts = posts.filter((p) => state.savedPosts.includes(p.id));
  const savedPlaces = places.filter((p) => state.savedPlaces.includes(p.id));

  return (
    <ContentColumn>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={t("saved.title")}
          subtitle={t("saved.private")}
        />

        {/* Tabs switcher: Posts | Places */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm w-fit">
          <button
            type="button"
            onClick={() => setTab("posts")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all",
              tab === "posts"
                ? "bg-surface text-foreground shadow-sm font-bold border border-border/60"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <MessageSquare className="size-3.5 text-forest" />
            <span>{t("saved.posts")}</span>
            <span className="rounded-full bg-surface px-1.5 py-0.2 text-[10px] text-muted-foreground border border-border">
              {savedPosts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab("places")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all",
              tab === "places"
                ? "bg-surface text-foreground shadow-sm font-bold border border-border/60"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Compass className="size-3.5 text-forest" />
            <span>{t("saved.places")}</span>
            <span className="rounded-full bg-surface px-1.5 py-0.2 text-[10px] text-muted-foreground border border-border">
              {savedPlaces.length}
            </span>
          </button>
        </div>

        {/* Tab content */}
        {tab === "posts" && (
          <div className="space-y-4">
            {savedPosts.length > 0 ? (
              savedPosts.map((post) => <PostCard key={post.id} post={post} />)
            ) : (
              <EmptyState
                icon={Bookmark}
                title={t("saved.posts")}
                body={t("saved.empty")}
                action={
                  <Link
                    to="/community"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-forest/90"
                  >
                    <span>{t("nav.community")}</span>
                  </Link>
                }
              />
            )}
          </div>
        )}

        {tab === "places" && (
          <div>
            {savedPlaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedPlaces.map((place) => {
                  const hood = place.neighborhood ? t(`hood.${place.neighborhood}`) : t("common.tashkent");
                  return (
                    <Link
                      key={place.id}
                      to="/places/$placeId"
                      params={{ placeId: place.id }}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:border-forest/40"
                    >
                      <div className="relative h-40 w-full overflow-hidden bg-surface">
                        {place.coverImage ? (
                          <img
                            src={place.coverImage}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-forest">
                            <MapPin className="size-8" />
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          {t("common.demo")}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            guard(() => dispatch({ type: "toggleSavePlace", placeId: place.id }));
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-signal text-signal-foreground shadow-md"
                          aria-label={t("action.saved")}
                        >
                          <Bookmark className="size-3.5 fill-current" />
                        </button>
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-forest">
                          {t(`cat.${place.categories[0] ?? "food"}`)} · {hood}
                        </span>
                        <h2 className="text-base font-bold text-foreground group-hover:text-forest transition-colors truncate mt-0.5">
                          {place.name}
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {place.summary}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Compass}
                title={t("saved.places")}
                body={t("saved.empty")}
                action={
                  <Link
                    to="/discover"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-forest/90"
                  >
                    <span>{t("nav.discover")}</span>
                  </Link>
                }
              />
            )}
          </div>
        )}
      </div>
    </ContentColumn>
  );
}
