import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useT } from "@/state/preferences";
import { Sidebar } from "./Sidebar";
import { MobileTabBar, MobileTopBar } from "./MobileBars";
import { PreviewNotice } from "./PreviewNotice";
import { DemoGateDialog } from "@/components/auth/DemoGateDialog";

export function AppShell({ children }: { children: ReactNode }) {
  const t = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/auth");

  if (isAuthRoute) {
    return (
      <TooltipProvider delayDuration={200}>
        <div className="flex min-h-dvh flex-col bg-background">
          <PreviewNotice />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        {t("nav.skip")}
      </a>
      <div className="flex min-h-dvh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileTopBar />
          <PreviewNotice />
          <main id="main" tabIndex={-1} className="flex-1 pb-24 outline-none md:pb-10">
            {children}
          </main>
        </div>
      </div>
      <MobileTabBar />
      <DemoGateDialog />
    </TooltipProvider>
  );
}

/** Center column with optional contextual right rail (desktop only). */
export function ContentWithRail({ children, rail }: { children: ReactNode; rail?: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1120px] gap-8 px-4 pt-5 sm:px-6 md:pt-8 lg:px-8">
      <div className="min-w-0 flex-1 xl:max-w-[700px]">{children}</div>
      {rail && (
        <aside className="hidden w-[280px] shrink-0 xl:block 2xl:w-[310px]">
          <div className="sticky top-6 space-y-4">{rail}</div>
        </aside>
      )}
    </div>
  );
}

export function ContentColumn({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto w-full px-4 pt-5 sm:px-6 md:pt-8 lg:px-8 ${wide ? "max-w-[1120px]" : "max-w-[760px]"}`}>
      {children}
    </div>
  );
}
