import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, Sparkles, HelpCircle, ArrowRight, MapPin, Compass, Search } from "lucide-react";
import { ContentWithRail } from "@/components/navigation/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { PostCard } from "@/components/feed/PostCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Avatar } from "@/components/common/Avatar";
import { useDemo } from "@/state/demo-store";
import { usePrefs, useT } from "@/state/preferences";
import { filterFeed } from "@/domain/filters";
import type { FeedTab, FeedChip } from "@/domain/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/community/")({
  component: CommunityPage,
});

function CommunityPage() {
  const t = useT();
  const { prefs } = usePrefs();
  const { posts, places, placesById, state, personById } = useDemo();

  const [tab, setTab] = useState<FeedTab>("forYou");
  const [chip, setChip] = useState<FeedChip>("all");
  const [query, setQuery] = useState("");

  const me = personById("me");

  // Deterministic feed filtering
  const filteredPosts = useMemo(() => {
    return filterFeed(posts, {
      tab,
      chip,
      following: state.following,
      hidden: state.hidden,
      neighborhood: prefs.neighborhood,
      query,
      placesById,
    });
  }, [posts, tab, chip, state.following, state.hidden, prefs.neighborhood, query, placesById]);

  // Places mentioned in feed
  const mentionedPlaces = useMemo(() => {
    const ids = new Set(posts.map((p) => p.placeId).filter(Boolean) as string[]);
    return places.filter((p) => ids.has(p.id)).slice(0, 3);
  }, [posts, places]);

  // Open questions
  const openQuestions = useMemo(() => {
    return posts.filter((p) => p.kind === "question").slice(0, 3);
  }, [posts]);

  const tabs: Array<{ key: FeedTab; label: string }> = [
    { key: "forYou", label: t("tab.forYou") },
    { key: "following", label: t("tab.following") },
    { key: "nearby", label: t("tab.nearby") },
  ];

  const chips: Array<{ key: FeedChip; label: string }> = [
    { key: "all", label: t("chip.all") },
    { key: "questions", label: t("chip.questions") },
    { key: "experiences", label: t("chip.experiences") },
    { key: "food", label: t("chip.food") },
    { key: "coffee", label: t("chip.coffee") },
    { key: "services", label: t("chip.services") },
  ];

  const rightRail = (
    <div className="space-y-6">
      {/* Places Mentioned Nearby */}
      {mentionedPlaces.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="size-4 text-forest" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {t("rail.placesMentioned")}
            </h3>
          </div>
          <div className="space-y-2.5">
            {mentionedPlaces.map((place) => (
              <Link
                key={place.id}
                to="/places/$placeId"
                params={{ placeId: place.id }}
                className="group flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-surface"
              >
                {place.coverImage ? (
                  <img
                    src={place.coverImage}
                    alt=""
                    className="size-11 rounded-lg object-cover"
                  />
                ) : (
                  <div className="size-11 rounded-lg bg-surface flex items-center justify-center text-forest">
                    <MapPin className="size-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-foreground group-hover:text-forest">
                    {place.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {place.neighborhood ? t(`hood.${place.neighborhood}`) : t("common.tashkent")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            to="/discover"
            className="mt-3 flex items-center justify-between border-t border-border pt-2.5 text-xs font-semibold text-forest hover:underline"
          >
            <span>{t("rail.discoverTitle")}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </section>
      )}

      {/* Open Questions */}
      {openQuestions.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="size-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {t("rail.openQuestions")}
            </h3>
          </div>
          <div className="space-y-3">
            {openQuestions.map((q) => (
              <Link
                key={q.id}
                to="/community/post/$postId"
                params={{ postId: q.id }}
                className="block text-xs font-medium text-foreground hover:text-forest transition-colors line-clamp-2"
              >
                {q.title || q.text}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* About Demo Notice */}
      <section className="rounded-2xl border border-border bg-surface p-4 text-xs text-muted-foreground">
        <h4 className="font-bold text-foreground mb-1 flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-forest" />
          {t("rail.aboutDemo")}
        </h4>
        <p className="leading-relaxed">{t("rail.aboutDemoBody")}</p>
      </section>
    </div>
  );

  return (
    <ContentWithRail rail={rightRail}>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={t("community.title")}
          subtitle={t("community.subtitle")}
        />

        {/* Compose Shortcut Bar */}
        <Link
          to="/create"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card transition-[border-color,background-color] hover:border-forest/40 hover:bg-surface group"
        >
          <Avatar person={me} className="size-9" />
          <span className="flex-1 text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            {t("community.compose")}
          </span>
          <span className="rounded-xl bg-signal px-3 py-1.5 text-xs font-bold text-signal-foreground shadow-sm">
            + {t("nav.create")}
          </span>
        </Link>

        {/* Feed Controls */}
        <div className="space-y-3">
          {/* Main Feed Tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm w-fit">
            {tabs.map((tabItem) => {
              const active = tab === tabItem.key;
              return (
                <button
                  key={tabItem.key}
                  type="button"
                  onClick={() => setTab(tabItem.key)}
                  className={cn(
                    "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all",
                    active
                      ? "bg-surface text-foreground shadow-sm font-bold border border-border/60"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tabItem.label}
                </button>
              );
            })}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {chips.map((chipItem) => {
              const active = chip === chipItem.key;
              return (
                <button
                  key={chipItem.key}
                  type="button"
                  onClick={() => setChip(chipItem.key)}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                    active
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-forest/40 hover:text-foreground",
                  )}
                >
                  {chipItem.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <EmptyState
              icon={MessageSquare}
              title={t("feed.emptyTitle")}
              body={
                tab === "following"
                  ? t("feed.followingEmpty")
                  : tab === "nearby"
                  ? t("feed.nearbyPick")
                  : t("feed.emptyBody")
              }
              action={
                <button
                  type="button"
                  onClick={() => {
                    setTab("forYou");
                    setChip("all");
                  }}
                  className="rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-forest/90"
                >
                  {t("common.clearFilters")}
                </button>
              }
            />
          )}
        </div>
      </div>
    </ContentWithRail>
  );
}
