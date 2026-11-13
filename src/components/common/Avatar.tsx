import { cn } from "@/lib/utils";
import type { Person } from "@/domain/types";

const toneClass: Record<Person["avatarTone"], string> = {
  1: "bg-avatar-1",
  2: "bg-avatar-2",
  3: "bg-avatar-3",
  4: "bg-avatar-4",
  5: "bg-avatar-5",
};

const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-20 text-2xl", xl: "size-24 text-3xl" };

/** Generic demo avatar: initials on a tone. No photos of real people. */
export function Avatar({ person, size = "md", className }: { person?: Person | undefined; size?: keyof typeof sizes; className?: string }) {
  const initials = (person?.displayName ?? "?")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold text-foreground",
        toneClass[person?.avatarTone ?? 1],
        sizes[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}
