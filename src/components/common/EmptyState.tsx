import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center", className)}>
      <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-signal-soft text-forest">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
