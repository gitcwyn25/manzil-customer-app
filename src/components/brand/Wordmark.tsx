import { cn } from "@/lib/utils";

/**
 * TODO(brand): Replace with the approved Manzil SVG logo (three stacked slanted
 * bands + rounded square). Do not draw an approximation of the mark here.
 * Until the official asset is supplied, this neutral text wordmark is used.
 */
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-baseline gap-0.5 font-sans font-extrabold tracking-tight text-foreground", className)}>
      {compact ? "M" : "Manzil"}
      <span aria-hidden className="inline-block size-1.5 translate-y-[-1px] rounded-[2px] bg-signal" />
    </span>
  );
}
