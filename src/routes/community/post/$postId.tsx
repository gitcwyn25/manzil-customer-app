import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { ContentColumn } from "@/components/navigation/AppShell";
import { PostCard } from "@/components/feed/PostCard";
import { Avatar } from "@/components/common/Avatar";
import { RelativeTime } from "@/components/common/RelativeTime";
import { EmptyState } from "@/components/common/EmptyState";
import { useDemo, newId } from "@/state/demo-store";
import { useT } from "@/state/preferences";
import { ME_ID } from "@/domain/types";

export const Route = createFileRoute("/community/post/$postId")({
  component: PostDetailPage,
});

function PostDetailPage() {
  const { postId } = Route.useParams();
  const navigate = useNavigate();
  const t = useT();
  const { posts, commentsFor, dispatch, guard, personById } = useDemo();

  const [text, setText] = useState("");

  const post = posts.find((p) => p.id === postId);
  const comments = commentsFor(postId);
  const me = personById(ME_ID);

  if (!post) {
    return (
      <ContentColumn>
        <div className="py-12">
          <EmptyState
            icon={MessageCircle}
            title={t("post.notFound")}
            body={t("post.notFoundBody")}
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

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    guard(() => {
      const id = newId("cmt");
      dispatch({
        type: "addComment",
        comment: {
          id,
          postId: post.id,
          authorId: ME_ID,
          text: text.trim(),
          createdAt: new Date().toISOString(),
          isLocal: true,
        },
      });
      setText("");
      toast.success(t("post.replySaved"));
    });
  };

  return (
    <ContentColumn>
      <div className="space-y-6">
        {/* Back navigation */}
        <div>
          <button
            type="button"
            onClick={() => navigate({ to: "/community" })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>{t("common.back")}</span>
          </button>
        </div>

        {/* Detailed Post Card */}
        <PostCard post={post} detail={true} onDeleted={() => navigate({ to: "/community" })} />

        {/* Discussion Section */}
        <section id="discussion" className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-foreground">
            <MessageCircle className="size-5 text-forest" />
            <span>{t("post.discussion")} ({comments.length})</span>
          </h2>

          {/* Reply composer form */}
          <form onSubmit={handleReply} className="flex items-start gap-3 pt-2">
            <Avatar person={me} className="size-8 shrink-0 mt-1" />
            <div className="flex-1 space-y-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("post.replyPlaceholder")}
                rows={2}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-forest focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-forest/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="size-3.5" />
                  <span>{t("post.send")}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Comments list */}
          <div className="space-y-3 pt-3 border-t border-border">
            {comments.length > 0 ? (
              comments.map((comment) => {
                const author = personById(comment.authorId);
                return (
                  <div key={comment.id} className="flex items-start gap-3 rounded-xl bg-surface/60 p-3 border border-border/60">
                    <Avatar person={author} className="size-7 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-foreground">
                          {author?.displayName ?? "—"}
                        </span>
                        <RelativeTime iso={comment.createdAt} className="text-[11px] text-muted-foreground" />
                      </div>
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-6 text-xs text-muted-foreground">
                {t("post.noReplies")}
              </p>
            )}
          </div>
        </section>
      </div>
    </ContentColumn>
  );
}
