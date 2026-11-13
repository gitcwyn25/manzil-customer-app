import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bookmark,
  Share2,
  MapPin,
  Clock,
  Phone,
  Globe,
  Sparkles,
  Plus,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { ContentColumn } from "@/components/navigation/AppShell";
import { PostCard } from "@/components/feed/PostCard";
import { EmptyState } from "@/components/common/EmptyState";
import { useDemo } from "@/state/demo-store";
import { useT } from "@/state/preferences";
import { postsForPlace } from "@/domain/filters";
import { copyLink } from "@/lib/share";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/places/$placeId")({
  component: PlaceDetailPage,
});

function PlaceDetailPage() {
  const { placeId } = Route.useParams();
  const navigate = useNavigate();
  const t = useT();
  const { placesById, posts, state, dispatch, guard } = useDemo();

  const [tab, setTab] = useState<"overview" | "experiences" | "posts" | "photos">("overview");

  const place = placesById.get(placeId);

  if (!place) {
    return (
      <ContentColumn>
        <div className="py-12">
          <EmptyState
            icon={MapPin}
            title={t("place.notFound")}
            action={
              <Link
                to="/discover"
                className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest/90"
              >
                <ArrowLeft className="size-4" />
                {t("place.backToDiscover")}
              </Link>
            }
          />
        </div>
      </ContentColumn>
    );
  }

  const { experiences, other } = postsForPlace(posts, place.id, state.hidden);
  const saved = state.savedPlaces.includes(place.id);
  const hood = place.neighborhood ? t(`hood.${place.neighborhood}`) : t("common.tashkent");

  const handleShare = async () => {
    if (await copyLink(`/places/${place.id}`)) {
      toast.success(t("common.linkCopied"));
    }
  };

  return (
    <ContentColumn>
      <div className="space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate({ to: "/discover" })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>{t("place.backToDiscover")}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
              aria-label={t("action.share")}
            >
              <Share2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => guard(() => dispatch({ type: "toggleSavePlace", placeId: place.id }))}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all",
                saved
                  ? "bg-signal-soft border-forest/30 text-forest"
                  : "bg-card border-border text-foreground hover:bg-surface",
              )}
            >
              <Bookmark className={cn("size-3.5", saved && "fill-forest")} />
              <span>{saved ? t("action.saved") : t("action.save")}</span>
            </button>
          </div>
        </div>

        {/* Place Hero Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-surface">
            {place.coverImage ? (
              <img
                src={place.coverImage}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-forest">
                <MapPin className="size-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute top-3 left-3 rounded bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              {t("common.illustrative").toUpperCase()}
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="mb-2 inline-block rounded-md bg-signal px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-signal-foreground">
                {t(`cat.${place.categories[0] ?? "food"}`)}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {place.name}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-white/90">
                <MapPin className="size-3.5 text-signal" />
                <span>{hood} · {place.city}</span>
              </p>
            </div>
          </div>

          {/* Illustrative Notice Bar */}
          <div className="border-b border-t border-border bg-surface px-4 py-2 text-xs text-muted-foreground">
            {t("place.illustrative")}
          </div>

          {/* Share Experience CTA banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border bg-signal-soft/40 p-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t("place.shareExperience")}
              </h2>
              <p className="text-xs text-muted-foreground">
                Help people make better decisions by sharing what you saw.
              </p>
            </div>
            <Link
              to="/create"
              search={{ place: place.id, kind: "experience" }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-forest px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-forest/90"
            >
              <Plus className="size-3.5" />
              <span>{t("place.shareExperience")}</span>
            </Link>
          </div>

          {/* Tabs header */}
          <div className="flex items-center border-b border-border px-4 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setTab("overview")}
              className={cn(
                "py-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap",
                tab === "overview" ? "border-forest text-forest" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t("place.tab.overview")}
            </button>
            <button
              type="button"
              onClick={() => setTab("experiences")}
              className={cn(
                "py-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5",
                tab === "experiences" ? "border-forest text-forest" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <span>{t("place.tab.experiences")}</span>
              <span className="rounded-full bg-signal-soft px-1.5 py-0.2 text-[10px] text-forest font-bold">
                {experiences.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("posts")}
              className={cn(
                "py-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5",
                tab === "posts" ? "border-forest text-forest" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <span>{t("place.tab.posts")}</span>
              <span className="rounded-full bg-surface px-1.5 py-0.2 text-[10px] text-muted-foreground border border-border">
                {other.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("photos")}
              className={cn(
                "py-3 px-3.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap",
                tab === "photos" ? "border-forest text-forest" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t("place.tab.photos")}
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-5">
            {tab === "overview" && (
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {t("place.about")}
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {place.summary || t("common.notAvailable")}
                  </p>
                </div>

                {/* Features mentioned */}
                {place.features && place.features.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {t("place.features")}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mb-2.5">
                      {t("place.featuresNote")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {place.features.map((feat) => (
                        <span
                          key={feat}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground"
                        >
                          <CheckCircle2 className="size-3.5 text-forest" />
                          <span>{feat}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Operating details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-3">
                    <Clock className="size-4 text-forest shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] font-semibold text-muted-foreground">
                        {t("place.hours")}
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {place.hours || t("common.notAvailable")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-3">
                    <MapPin className="size-4 text-forest shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] font-semibold text-muted-foreground">
                        {t("place.location")}
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {hood}, {place.city}
                      </span>
                    </div>
                  </div>

                  {place.phone && (
                    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-3">
                      <Phone className="size-4 text-forest shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] font-semibold text-muted-foreground">
                          {t("place.contact")}
                        </span>
                        <span className="text-xs font-medium text-foreground">
                          {place.phone} ({t("common.demo")})
                        </span>
                      </div>
                    </div>
                  )}

                  {place.website && (
                    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-3">
                      <Globe className="size-4 text-forest shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[11px] font-semibold text-muted-foreground">
                          Website
                        </span>
                        <span className="text-xs font-medium text-foreground">
                          {place.website}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "experiences" && (
              <div className="space-y-4">
                {experiences.length > 0 ? (
                  experiences.map((exp) => (
                    <PostCard key={exp.id} post={exp} showPlace={false} />
                  ))
                ) : (
                  <EmptyState
                    icon={Sparkles}
                    title={t("place.noExperiences")}
                    body={t("place.noExperiencesBody")}
                    action={
                      <Link
                        to="/create"
                        search={{ place: place.id, kind: "experience" }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-forest/90"
                      >
                        <Plus className="size-4" />
                        {t("place.shareExperience")}
                      </Link>
                    }
                  />
                )}
              </div>
            )}

            {tab === "posts" && (
              <div className="space-y-4">
                {other.length > 0 ? (
                  other.map((p) => (
                    <PostCard key={p.id} post={p} showPlace={false} />
                  ))
                ) : (
                  <EmptyState
                    icon={MessageSquare}
                    title={t("place.noPosts")}
                    body={t("place.noPostsBody")}
                    action={
                      <Link
                        to="/create"
                        search={{ place: place.id, kind: "question" }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-forest/90"
                      >
                        <Plus className="size-4" />
                        {t("place.ask")}
                      </Link>
                    }
                  />
                )}
              </div>
            )}

            {tab === "photos" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {place.gallery && place.gallery.length > 0 ? (
                  place.gallery.map((media, idx) => (
                    media && (
                      <div key={idx} className="relative h-44 overflow-hidden rounded-xl border border-border bg-surface">
                        <img
                          src={media.src}
                          alt={media.alt}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm">
                          {t("common.illustrativeImage")}
                        </span>
                      </div>
                    )
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                    {t("place.noPhotos")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ContentColumn>
  );
}
