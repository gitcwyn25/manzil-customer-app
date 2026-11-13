import { Link } from "@tanstack/react-router";
import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CommunityPost } from "@/domain/types";
import { useDemo } from "@/state/demo-store";
import { useT } from "@/state/preferences";
import { shareLink } from "@/lib/share";

const actionBtn =
  "inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2.5 text-[13px] font-semibold text-muted-foreground transition-colors duration-150 hover:bg-surface hover:text-foreground";

export function PostActions({ post, replyCount }: { post: CommunityPost; replyCount: number }) {
  const t = useT();
  const { state, dispatch, guard } = useDemo();
  const liked = state.liked.includes(post.id);
  const saved = state.savedPosts.includes(post.id);
  const likes = (post.demoCounts?.likes ?? 0) + (liked ? 1 : 0);

  return (
    <div className="-mx-2.5 flex items-center justify-between gap-1">
      <div className="flex items-center gap-1">
        <Link
          to="/community/post/$postId"
          params={{ postId: post.id }}
          hash="discussion"
          className={actionBtn}
          aria-label={`${t("action.reply")} (${replyCount})`}
        >
          <MessageCircle className="size-[18px]" aria-hidden />
          <span aria-hidden>{replyCount}</span>
        </Link>
        <button
          type="button"
          aria-pressed={liked}
          aria-label={`${liked ? t("action.liked") : t("action.like")} (${likes})`}
          className={cn(actionBtn, liked && "text-foreground")}
          onClick={() => guard(() => dispatch({ type: "toggleLike", postId: post.id }))}
        >
          <Heart
            key={liked ? "on" : "off"}
            className={cn("size-[18px]", liked && "animate-pop fill-signal stroke-foreground")}
            aria-hidden
          />
          <span aria-hidden>{likes}</span>
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? t("action.saved") : t("action.save")}
          className={cn(actionBtn, saved && "text-foreground")}
          onClick={() => guard(() => dispatch({ type: "toggleSavePost", postId: post.id }))}
        >
          <Bookmark
            key={saved ? "on" : "off"}
            className={cn("size-[18px]", saved && "animate-pop fill-signal stroke-foreground")}
            aria-hidden
          />
          <span className="hidden sm:inline">{saved ? t("action.saved") : t("action.save")}</span>
        </button>
        <button
          type="button"
          aria-label={t("action.share")}
          className={actionBtn}
          onClick={async () => {
            const result = await shareLink(`/community/post/${post.id}`, "Manzil");
            if (result === "copied") toast.success(t("common.linkCopied"));
          }}
        >
          <Share2 className="size-[18px]" aria-hidden />
        </button>
      </div>
    </div>
  );
}
