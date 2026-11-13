import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { UserCheck, UserPlus, MapPin, MessageSquare, ArrowLeft } from "lucide-react";
import { ContentColumn } from "@/components/navigation/AppShell";
import { Avatar } from "@/components/common/Avatar";
import { PostCard } from "@/components/feed/PostCard";
import { EmptyState } from "@/components/common/EmptyState";
import { useDemo } from "@/state/demo-store";
import { useT } from "@/state/preferences";
import { ME_ID, type ContentKind } from "@/domain/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile/$handle")({
  component: ProfilePage,
});

function ProfilePage() {
  const { handle } = Route.useParams();
  const t = useT();
  const { personByHandle, posts, state, dispatch, guard } = useDemo();

  const [activeTab, setActiveTab] = useState<"all" | ContentKind>("all");

  const person = personByHandle(handle);

  if (!person) {
    return (
      <ContentColumn>
        <div className="py-12">
          <EmptyState
            icon={MessageSquare}
            title={t("profile.notFound")}
            action={
              <Link
                to="/community"
                className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest/90"
              >
                <ArrowLeft className="size-4" />
                {t("common.back")}
              </Link>
            }
          />
        </div>
      </ContentColumn>
    );
  }

  const isMe = person.id === ME_ID;
  const isFollowing = state.following.includes(person.id);
  const personPosts = posts.filter((p) => p.authorId === person.id);
  const filteredPosts = personPosts.filter((p) => (activeTab === "all" ? true : p.kind === activeTab));

  return (
    <ContentColumn>
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="h-28 bg-gradient-to-r from-signal/25 via-surface to-forest/15 border-b border-border relative">
            <span className="absolute top-3 right-3 rounded-md bg-card/80 px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border">
              {isMe ? t("profile.you") : t("profile.demoPerson")}
            </span>
          </div>

          <div className="p-5 sm:p-6 -mt-12 relative">
            <div className="flex items-end justify-between gap-4 mb-4">
              <Avatar person={person} className="size-20 sm:size-24 border-4 border-card shadow-md" />
              {!isMe && (
                <button
                  type="button"
                  onClick={() => guard(() => dispatch({ type: "toggleFollow", personId: person.id }))}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs",
                    isFollowing
                      ? "bg-surface border border-border text-forest font-bold"
                      : "bg-signal text-signal-foreground hover:bg-signal/90 font-bold",
                  )}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="size-3.5" />
                      <span>{t("action.following")}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-3.5" />
                      <span>{t("action.follow")}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div>
              <h1 className="text-xl font-bold text-foreground">
                {person.displayName}
              </h1>
              <p className="text-xs text-muted-foreground">@{person.handle}</p>
              {person.bio && (
                <p className="mt-2 text-sm text-foreground leading-relaxed max-w-lg">
                  {person.bio}
                </p>
              )}
              {person.neighborhood && (
                <p className="mt-2.5 flex items-center gap-1 text-xs text-forest font-semibold">
                  <MapPin className="size-3.5" />
                  <span>{t(`hood.${person.neighborhood}`)}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contributions Tabs */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 border-b border-border pb-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                activeTab === "all" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-surface",
              )}
            >
              {t("chip.all")} ({personPosts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("post")}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                activeTab === "post" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-surface",
              )}
            >
              {t("kind.post")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("experience")}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                activeTab === "experience" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-surface",
              )}
            >
              {t("kind.experienceShort")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("question")}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                activeTab === "question" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-surface",
              )}
            >
              {t("kind.question")}
            </button>
          </div>

          {/* Contributions List */}
          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((p) => <PostCard key={p.id} post={p} />)
            ) : (
              <EmptyState
                icon={MessageSquare}
                title={t("profile.empty")}
              />
            )}
          </div>
        </div>
      </div>
    </ContentColumn>
  );
}
