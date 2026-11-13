import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/brand/Wordmark";
import { useT } from "@/state/preferences";
import { isActive, mobileNav } from "./nav-items";
import { useUnreadCount } from "./useUnreadCount";

export function MobileTopBar() {
  const t = useT();
  const unread = useUnreadCount();
  return (
    <div className="pt-safe sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link to="/community" aria-label="Manzil" className="rounded-lg">
          <Wordmark className="text-xl" />
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/notifications"
            className="relative inline-flex size-11 items-center justify-center rounded-xl text-foreground hover:bg-surface"
            aria-label={unread > 0 ? `${t("nav.notifications")} (${unread})` : t("nav.notifications")}
          >
            <Bell className="size-5" aria-hidden />
            {unread > 0 && (
              <span className="absolute right-2.5 top-2.5 size-2.5 rounded-full border-2 border-background bg-forest" aria-hidden />
            )}
          </Link>
          <Link
            to="/settings"
            className="inline-flex size-11 items-center justify-center rounded-xl text-foreground hover:bg-surface"
            aria-label={t("nav.settings")}
          >
            <Settings className="size-5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function MobileTabBar() {
  const t = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label={t("nav.main")}
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
        {mobileNav.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          const isCreate = item.to === "/create";
          return (
            <li key={item.to} className="flex">
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {isCreate ? (
                  <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-signal text-signal-foreground shadow-sm">
                    <Icon className="size-5" aria-hidden />
                  </span>
                ) : (
                  <span className={cn("inline-flex h-7 w-12 items-center justify-center rounded-full transition-colors", active && "bg-signal-soft")}>
                    <Icon className="size-5" aria-hidden />
                  </span>
                )}
                <span className={cn(isCreate && "sr-only")}>{t(item.label)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
