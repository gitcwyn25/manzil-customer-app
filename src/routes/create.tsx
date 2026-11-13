import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  MessageSquare,
  Sparkles,
  HelpCircle,
  MapPin,
  Image as ImageIcon,
  X,
  ArrowLeft,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { ContentColumn } from "@/components/navigation/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDemo } from "@/state/demo-store";
import { useT } from "@/state/preferences";
import type { ContentKind, NeighborhoodId } from "@/domain/types";
import { cn } from "@/lib/utils";

type CreateSearchParams = {
  edit?: string;
  place?: string;
  kind?: ContentKind;
};

export const Route = createFileRoute("/create")({
  validateSearch: (search: Record<string, unknown>): CreateSearchParams => ({
    edit: typeof search.edit === "string" ? search.edit : undefined,
    place: typeof search.place === "string" ? search.place : undefined,
    kind: (search.kind as ContentKind) || undefined,
  }),
  component: CreatePage,
});

function CreatePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const t = useT();
  const { places, posts, createPost, dispatch, guard } = useDemo();

  const editPost = search.edit ? posts.find((p) => p.id === search.edit) : undefined;

  const [kind, setKind] = useState<ContentKind>(editPost?.kind ?? search.kind ?? "post");
  const [title, setTitle] = useState(editPost?.title ?? "");
  const [text, setText] = useState(editPost?.text ?? "");
  const [placeId, setPlaceId] = useState<string>(editPost?.placeId ?? search.place ?? "");
  const [photoPreview, setPhotoPreview] = useState<string | null>(editPost?.media?.[0]?.src ?? null);
  const [discardOpen, setDiscardOpen] = useState(false);

  useEffect(() => {
    if (search.place) {
      setPlaceId(search.place);
      if (search.kind) setKind(search.kind);
    }
  }, [search.place, search.kind]);

  const dirty = text.trim().length > 0 || title.trim().length > 0;

  const handleBack = () => {
    if (dirty) {
      setDiscardOpen(true);
    } else {
      navigate({ to: "/community" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error(t("create.empty"));
      return;
    }

    if (kind === "experience" && !placeId) {
      toast.error(t("create.placeRequired"));
      return;
    }

    const selectedPlace = places.find((p) => p.id === placeId);
    const media = photoPreview
      ? [{ src: photoPreview, alt: "Demo contribution photo", illustrative: true }]
      : undefined;

    guard(() => {
      if (editPost) {
        dispatch({
          type: "updatePost",
          id: editPost.id,
          updatedAt: new Date().toISOString(),
          input: {
            kind,
            title: title.trim() || undefined,
            text: text.trim(),
            placeId: placeId || undefined,
            neighborhood: selectedPlace?.neighborhood,
            media,
          },
        });
        toast.success(t("create.published"));
        navigate({ to: "/community/post/$postId", params: { postId: editPost.id } });
      } else {
        const id = createPost({
          kind,
          title: title.trim() || undefined,
          text: text.trim(),
          placeId: placeId || undefined,
          neighborhood: selectedPlace?.neighborhood,
          media,
        });
        toast.success(t("create.published"));
        navigate({ to: "/community/post/$postId", params: { postId: id } });
      }
    });
  };

  return (
    <ContentColumn>
      <div className="space-y-6">
        {/* Header with back */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <PageHeader
            title={editPost ? t("create.editTitle") : t("create.title")}
            className="flex-1"
          />
        </div>

        {/* Composer Form */}
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-card">
          {/* Kind selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("create.type")}
            </label>
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface p-1">
              <button
                type="button"
                onClick={() => setKind("post")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
                  kind === "post"
                    ? "bg-card text-foreground shadow-sm font-bold border border-border/60"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <MessageSquare className="size-3.5 text-forest" />
                <span>{t("kind.post")}</span>
              </button>

              <button
                type="button"
                onClick={() => setKind("question")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
                  kind === "question"
                    ? "bg-card text-foreground shadow-sm font-bold border border-border/60"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <HelpCircle className="size-3.5 text-amber-500" />
                <span>{t("kind.question")}</span>
              </button>

              <button
                type="button"
                onClick={() => setKind("experience")}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all",
                  kind === "experience"
                    ? "bg-card text-foreground shadow-sm font-bold border border-border/60"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Sparkles className="size-3.5 text-signal" />
                <span>{t("kind.experienceShort")}</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {t("create.titleLabel")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                kind === "question"
                  ? "e.g. Best morning plov in Chilonzor?"
                  : kind === "experience"
                  ? "e.g. Wi-Fi speed and noise level review"
                  : "e.g. Morning walk observation"
              }
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground focus:border-forest focus:outline-none"
            />
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {t("create.textLabel")}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              rows={5}
              placeholder={
                kind === "question"
                  ? t("create.prompt.question")
                  : kind === "experience"
                  ? t("create.prompt.experience")
                  : t("create.prompt.post")
              }
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-forest focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Attach place */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground">
              {t("create.attachPlace")} {kind === "experience" && <span className="text-forest font-bold">*</span>}
            </label>
            <select
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-medium text-foreground focus:border-forest focus:outline-none cursor-pointer"
            >
              <option value="">{t("create.searchPlace")}</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.neighborhood ? t(`hood.${p.neighborhood}`) : t("common.tashkent")})
                </option>
              ))}
            </select>
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-foreground">
              {t("create.photos")}
            </label>
            {photoPreview ? (
              <div className="relative h-36 w-full sm:w-64 rounded-xl overflow-hidden border border-border bg-surface">
                <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/75 text-white hover:bg-black"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-surface p-3 text-xs text-muted-foreground hover:bg-surface/80 cursor-pointer transition-colors w-fit">
                <ImageIcon className="size-4 text-forest" />
                <span>{t("create.addPhoto")}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
            <p className="text-[11px] text-muted-foreground">
              {t("create.photosNote")}
            </p>
          </div>

          {/* Reminder */}
          <div className="rounded-xl border border-border bg-surface p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
            <Info className="size-4 text-forest shrink-0 mt-0.5" />
            <p className="leading-relaxed">{t("create.reminder")}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-[11px] text-muted-foreground">
              {t("create.public")}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={!text.trim()}
                className="rounded-xl bg-forest px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {editPost ? t("create.update") : t("create.submit")}
              </button>
            </div>
          </div>
        </form>

        {/* Discard confirmation dialog */}
        <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{t("create.discardTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("create.discardBody")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("create.keep")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => navigate({ to: "/community" })}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("create.discard")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ContentColumn>
  );
}
