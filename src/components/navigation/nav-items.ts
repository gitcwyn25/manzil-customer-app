import { Bell, Bookmark, Compass, Home, PlusSquare, Settings, User, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MessageKey } from "@/i18n";

export type NavTarget = "/community" | "/discover" | "/create" | "/saved" | "/notifications" | "/profile/me" | "/settings";

export type NavItem = {
  to: NavTarget;
  label: MessageKey;
  icon: LucideIcon;
  /** Path prefixes that mark this item active. */
  match: string[];
};

export const primaryNav: NavItem[] = [
  { to: "/community", label: "nav.community", icon: Users, match: ["/community"] },
  { to: "/discover", label: "nav.discover", icon: Compass, match: ["/discover", "/places"] },
  { to: "/create", label: "nav.create", icon: PlusSquare, match: ["/create"] },
  { to: "/saved", label: "nav.saved", icon: Bookmark, match: ["/saved"] },
  { to: "/notifications", label: "nav.notifications", icon: Bell, match: ["/notifications"] },
];

export const secondaryNav: NavItem[] = [
  { to: "/profile/me", label: "nav.profile", icon: User, match: ["/profile/me"] },
  { to: "/settings", label: "nav.settings", icon: Settings, match: ["/settings"] },
];

export const mobileNav: NavItem[] = [
  { to: "/community", label: "nav.home", icon: Home, match: ["/community"] },
  { to: "/discover", label: "nav.discover", icon: Compass, match: ["/discover", "/places"] },
  { to: "/create", label: "nav.create", icon: PlusSquare, match: ["/create"] },
  { to: "/saved", label: "nav.saved", icon: Bookmark, match: ["/saved"] },
  { to: "/profile/me", label: "nav.profile", icon: User, match: ["/profile"] },
];

export const isActive = (pathname: string, item: NavItem) =>
  item.match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
