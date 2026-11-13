import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/state/preferences";

/** Image with an honest "Illustrative" label. Falls back to a calm placeholder. */
export function IllustrativeImage({
  src,
  alt,
  illustrative = true,
  className,
  imgClassName,
  eager = false,
  showLabel = true,
}: {
  src?: string;
  alt: string;
  illustrative?: boolean | undefined;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  showLabel?: boolean;
}) {
  const t = useT();
  return (
    <div className={cn("relative overflow-hidden bg-surface", className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          width={1280}
          height={896}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground" role="img" aria-label={alt}>
          <ImageIcon className="size-6" aria-hidden />
        </div>
      )}
      {src && illustrative && showLabel && (
        <span className="micro-label absolute bottom-2 left-2 rounded-md bg-scrim px-1.5 py-0.5 text-on-media backdrop-blur-sm">
          {t("common.illustrativeImage")}
        </span>
      )}
    </div>
  );
}
