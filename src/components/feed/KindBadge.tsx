import { HelpCircle, MessageSquareText, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentKind, Sentiment } from "@/domain/types";
import { useT } from "@/state/preferences";

const icons = { post: MessageSquareText, question: HelpCircle, experience: Footprints };

export function KindBadge({ kind, sentiment, className }: { kind: ContentKind; sentiment?: Sentiment | undefined; className?: string }) {
  const t = useT();
  const Icon = icons[kind];
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
          kind === "question" && "bg-signal-soft text-foreground",
          kind === "experience" && "bg-primary text-primary-foreground",
          kind === "post" && "bg-surface text-muted-foreground",
        )}
      >
        <Icon className="size-3.5" aria-hidden />
        {t(`kind.${kind}`)}
      </span>
      {kind === "experience" && sentiment && (
        <span className="micro-label rounded-full border border-border px-2 py-0.5 text-muted-foreground">
          {t(`sentiment.${sentiment}`)}
        </span>
      )}
    </span>
  );
}
