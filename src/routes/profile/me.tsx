import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Edit3, MapPin, MessageSquare, Check } from "lucide-react";
import { toast } from "sonner";
import { ContentColumn } from "@/components/navigation/AppShell";
import { Avatar } from "@/components/common/Avatar";
import { PostCard } from "@/components/feed/PostCard";
import { EmptyState } from "@/components/common/EmptyState";
import { useDemo } from "@/state/demo-store";
import { useT } from "@/state/preferences";
import { ME_ID, type NeighborhoodId, type ContentKind } from "@/domain/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile/me")({
  component: MyProfilePage,
});

function MyProfilePage() {
  const t = useT();
  const { state, dispatch, posts } = useDemo();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(state.profile.displayName);
  const [bio, setBio] = useState(state.profile.bio);
  const [hood, setHood] = useState<NeighborhoodId | "none">(state.profile.neighborhood ?? "none");
  const [activeTab, setActiveTab] = useState<"all" | ContentKind>("all");

  const myPosts = posts.filter((p) => p.authorId === ME_ID);
  const filteredPosts = myPosts.filter((p) => (activeTab === "all" ? true : p.kind === activeTab));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({
      type: "updateProfile",
      profile: {
        displayName: name.trim() || state.profile.displayName,
        bio: bio.trim(),
        neighborhood: hood === "none" ? undefined : hood,
      },
    });
    setIsEditing(false);
    toast.success(t("profile.updated"));
  };

  const mePerson = {
    id: ME_ID,
    handle: "me",
    displayName: state.profile.displayName,
    bio: state.profile.bio,
    neighborhood: state.profile.neighborhood,
    avatarTone: 1 as const,
    isDemo: true as const,
  };

  const neighborhoods: Array<{ id: NeighborhoodId | "none"; label: string }> = [
    { id: "none", label: t("profile.none") },
    { id: "yunusabad", label: t("hood.yunusabad") },
    { id: "chilonzor", label: t("hood.chilonzor") },
    { id: "mirzo-ulugbek", label: t("hood.mirzo-ulugbek") },
    { id: "shaykhontohur", label: t("hood.shaykhontohur") },
    { id: "mirobod", label: t("hood.mirobod") },
  ];

  return (
    <ContentColumn>
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="h-28 bg-gradient-to-r from-signal/25 via-surface to-forest/15 border-b border-border relative">
            <span className="absolute top-3 right-3 rounded-md bg-card/80 px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border">
              {t("profile.you")}
            </span>
          </div>

          <div className="p-5 sm:p-6 -mt-12 relative">
            <div className="flex items-end justify-between gap-4 mb-4">
              <Avatar person={mePerson} className="size-20 sm:size-24 border-4 border-card shadow-md" />
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-card shadow-xs transition-colors"
              >
                <Edit3 className="size-3.5 text-forest" />
                <span>{isEditing ? t("common.cancel") : t("profile.edit")}</span>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-3.5 my-3 p-4 rounded-xl border border-border bg-surface">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("profile.displayName")}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:border-forest focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("profile.bio")}
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:border-forest focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {t("profile.neighborhood")}
                  </label>
                  <select
                    value={hood}
                    onChange={(e) => setHood(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:border-forest focus:outline-none cursor-pointer"
                  >
                    {neighborhoods.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-forest px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-forest/90"
                  >
                    {t("profile.saveChanges")}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {state.profile.displayName}
                </h1>
                <p className="text-xs text-muted-foreground">@me</p>
                <p className="mt-2 text-sm text-foreground leading-relaxed max-w-lg">
                  {state.profile.bio}
                </p>
                {state.profile.neighborhood && (
                  <p className="mt-2.5 flex items-center gap-1 text-xs text-forest font-semibold">
                    <MapPin className="size-3.5" />
                    <span>{t(`hood.${state.profile.neighborhood}`)}</span>
                  </p>
                )}
              </div>
            )}
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
              {t("chip.all")} ({myPosts.length})
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
