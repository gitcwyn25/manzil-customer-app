import { Link } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { useAuth } from "@/state/auth";
import { useT } from "@/state/preferences";

/** Compact, persistent notice that this is a frontend preview with illustrative content. */
export function PreviewNotice() {
  const t = useT();
  const { status } = useAuth();
  return (
    <div role="note" className="flex min-h-9 items-center justify-center gap-2 border-b border-border bg-surface px-4 py-1.5 text-center text-xs text-muted-foreground">
      <FlaskConical className="size-3.5 shrink-0 text-forest" aria-hidden />
      <span className="font-medium">{t("preview.notice")}</span>
      {status !== "demo" && (
        <Link to="/login" className="font-semibold text-forest underline-offset-2 hover:underline">
          {t("auth.exploreDemo")}
        </Link>
      )}
    </div>
  );
}
