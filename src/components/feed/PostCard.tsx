import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { CommunityPost } from "@/domain/types";
import { useDemo } from "@/state/demo-store";
import { useT } from "@/state/preferences";
import { Avatar } from "@/components/common/Avatar";
import { RelativeTime } from "@/components/common/RelativeTime";
import { IllustrativeImage } from "@/components/common/IllustrativeImage";
import { KindBadge } from "./KindBadge";
import { PlaceChip } from "./PlaceChip";
import { PostActions } from "./PostActions";
import { PostMenu } from "./PostMenu";

const CLAMP_AT = 260;

export function PostCard({
  post,
  showPlace = true,
  detail = false,
  onDeleted,
  className,
}: {
  post: CommunityPost;
  showPlace?: boolean;
  detail?: boolean;
  onDeleted?: (() => void) | undefined;
  className?: string;
}) {
  const t = useT();
  const { personById, placesById, commentsFor } = useDemo();
  const [expanded, setExpanded] = useState(false);
  const author = personById(post.authorId);
  const place = post.placeId ? placesById.get(post.placeId) : undefined;
  const hood = post.neighborhood ?? place?.neighborhood;
  const long = !detail && post.text.length > CLAMP_AT;
  const replies = commentsFor(post.id).length;
  const TextTag = detail ? "h1" : "h2";

  return (
    <article
      className={cn(
        "animate-rise rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5",
        className,
      )}
      aria-labelledby={`post-${post.id}-label`}
    >
      <header className="flex items-start gap-3">
        <Link to="/profile/$handle" params={{ handle: author?.handle ?? "me" }} className="rounded-full">
          <Avatar person={author} />
          <span className="sr-only">{author?.displayName}</span>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 text-sm">
            <Link
              to="/profile/$handle"
              params={{ handle: author?.handle ?? "me" }}
              className="font-bold text-foreground hover:underline"
            >
              {author?.displayName ?? "—"}
            </Link>
            <span className="text-muted-foreground" aria-hidden>·</span>
            <RelativeTime iso={post.createdAt} className="text-muted-foreground" />
            {post.updatedAt && <span className="text-xs text-muted-foreground">({t("common.edited")})</span>}
          </div>
          {hood && <p className="text-xs text-muted-foreground">{t(`hood.${hood}`)}</p>}
        </div>
        <PostMenu post={post} onDeleted={onDeleted} />
      </header>

      <div className="mt-3 space-y-3">
        <KindBadge kind={post.kind} sentiment={post.sentiment} />
        <div id={`post-${post.id}-label`}>
          {post.title && (
            <TextTag className={cn("font-extrabold tracking-tight text-foreground", detail ? "text-2xl" : "text-[17px]")}>
              {detail ? post.title : (
                <Link to="/community/post/$postId" params={{ postId: post.id }} className="hover:underline">
                  {post.title}
                </Link>
              )}
            </TextTag>
          )}
          {detail ? (
            <p className="whitespace-pre-line text-[16px] leading-relaxed text-foreground">{post.text}</p>
          ) : (
            <Link
              to="/community/post/$postId"
              params={{ postId: post.id }}
              className="block rounded-lg text-[15px] leading-relaxed text-foreground"
            >
              <span className={cn("whitespace-pre-line", long && !expanded && "line-clamp-4")}>{post.text}</span>
            </Link>
          )}
          {long && (
            <button
              type="button"
              className="mt-1 text-sm font-semibold text-forest hover:underline"
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? t("action.showLess") : t("action.readMore")}
            </button>
          )}
        </div>

        {post.media && post.media.length > 0 && (
          <div className={cn("grid gap-2", post.media.length > 1 && "grid-cols-2")}>
            {post.media.map((m) => (
              <IllustrativeImage
                key={m.src}
                src={m.src}
                alt={m.alt}
                illustrative={m.illustrative}
                className="aspect-[16/10] rounded-xl"
              />
            ))}
          </div>
        )}

        {showPlace && place && (
          <div className="context-line pt-1">
            <PlaceChip place={place} />
          </div>
        )}
      </div>

      <footer className="mt-2 border-t border-border pt-1">
        <PostActions post={post} replyCount={replies} />
      </footer>
    </article>
  );
}
