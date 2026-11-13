import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/brand/Wordmark";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useT } from "@/state/preferences";
import { isActive, primaryNav, secondaryNav, type NavItem } from "./nav-items";
import { useUnreadCount } from "./useUnreadCount";
import { NeighborhoodSelect } from "./NeighborhoodSelect";

function NavRow({ item, pathname, unread }: { item: NavItem; pathname: string; unread: number }) {
  const t = useT();
  const active = isActive(pathname, item);
  const Icon = item.icon;
  const label = t(item.label);
  const showBadge = item.to === "/notifications" && unread > 0;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={item.to}
          aria-current={active ? "page" : undefined}
          className={cn(
            "group relative flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition-colors duration-150 md:justify-center lg:justify-start",
            active
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-surface hover:text-foreground",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "absolute left-0 top-2.5 h-6 w-[3px] rounded-r-full bg-forest transition-transform duration-200",
              active ? "scale-y-100" : "scale-y-0",
            )}
          />
          <span className="relative">
            <Icon className="size-5" aria-hidden />
            {showBadge && (
              <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-sidebar bg-forest" aria-hidden />
            )}
          </span>
          <span className="md:sr-only lg:not-sr-only">{label}</span>
          {showBadge && (
            <span className="ml-auto hidden rounded-full bg-signal px-1.5 text-xs font-bold text-signal-foreground lg:inline">
              {unread}
            </span>
          )}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="lg:hidden">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  const t = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = useUnreadCount();

  return (
    <aside
      aria-label={t("nav.main")}
      className="sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-2 py-5 md:flex md:w-[76px] lg:w-[240px] lg:px-4"
    >
      <Link to="/community" className="mb-6 flex h-10 items-center rounded-lg px-3 md:justify-center lg:justify-start" aria-label="Manzil">
        <Wordmark className="text-[22px] md:hidden lg:inline-flex" />
        <Wordmark compact className="hidden text-[22px] md:inline-flex lg:hidden" />
      </Link>

      <nav className="flex flex-col gap-1">
        {primaryNav.map((item) => (
          <NavRow key={item.to} item={item} pathname={pathname} unread={unread} />
        ))}
      </nav>

      <div className="mt-6 hidden lg:block">
        <p className="micro-label mb-2 px-3 text-muted-foreground">{t("common.tashkent")} · {t("common.demo")}</p>
        <NeighborhoodSelect />
      </div>

      <div className="mt-auto flex flex-col gap-1 border-t border-sidebar-border pt-4">
        {secondaryNav.map((item) => (
          <NavRow key={item.to} item={item} pathname={pathname} unread={unread} />
        ))}
        <div
          className="mt-2 hidden items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-muted-foreground lg:flex"
          title={t("settings.businessNote")}
        >
          <ArrowUpRight className="size-3.5" aria-hidden />
          <span>{t("nav.forBusinesses")}</span>
          <span className="micro-label ml-auto rounded bg-surface px-1.5 py-0.5">{t("nav.awaitingLaunch")}</span>
        </div>
      </div>
    </aside>
  );
}
