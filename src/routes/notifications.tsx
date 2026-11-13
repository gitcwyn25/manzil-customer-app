import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, MessageCircle, AtSign, UserPlus, Sparkles, Check, CheckCheck } from "lucide-react";
import { ContentColumn } from "@/components/navigation/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Avatar } from "@/components/common/Avatar";
import { RelativeTime } from "@/components/common/RelativeTime";
import { useDemo } from "@/state/demo-store";
import { useT } from "@/state/preferences";
import { demoRepository } from "@/services/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const t = useT();
  const { state, dispatch, personById } = useDemo();

  const allNotifications = demoRepository.listNotifications();
  const unreadCount = allNotifications.filter((n) => !state.readNotifications.includes(n.id)).length;

  const handleMarkAll = () => {
    dispatch({ type: "markAllRead", ids: allNotifications.map((n) => n.id) });
  };

  const renderIcon = (kind: string) => {
    switch (kind) {
      case "reply":
        return <MessageCircle className="size-3.5 text-forest" />;
      case "mention":
        return <AtSign className="size-3.5 text-amber-500" />;
      case "follow":
        return <UserPlus className="size-3.5 text-signal" />;
      case "context":
        return <Sparkles className="size-3.5 text-forest" />;
      default:
        return <Bell className="size-3.5 text-muted-foreground" />;
    }
  };

  return (
    <ContentColumn>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={t("notifications.title")}
          subtitle={t("notifications.demo")}
          actions={
            unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm hover:bg-surface transition-colors"
              >
                <CheckCheck className="size-3.5 text-forest" />
                <span>{t("notifications.markAll")}</span>
              </button>
            )
          }
        />

        {/* Notifications list */}
        <div className="space-y-3">
          {allNotifications.length > 0 ? (
            allNotifications.map((notif) => {
              const actor = personById(notif.actorId);
              const read = state.readNotifications.includes(notif.id);
              const name = actor?.displayName ?? "Someone";
              const message = t(`notif.${notif.kind}`, { name });

              return (
                <div
                  key={notif.id}
                  onClick={() => dispatch({ type: "markRead", id: notif.id })}
                  className={cn(
                    "flex items-start justify-between gap-3 rounded-2xl border p-4 transition-all cursor-pointer",
                    read
                      ? "border-border bg-card/60"
                      : "border-forest/30 bg-card shadow-card",
                  )}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <Avatar person={actor} className="size-10" />
                      <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-card bg-surface shadow-xs">
                        {renderIcon(notif.kind)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-foreground leading-snug">
                        {message}
                      </p>
                      <RelativeTime iso={notif.createdAt} className="mt-1 block text-[11px] text-muted-foreground" />
                    </div>
                  </div>

                  {!read && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: "markRead", id: notif.id });
                      }}
                      className="p-1 text-forest hover:bg-surface rounded-lg shrink-0"
                      title={t("notifications.markRead")}
                    >
                      <Check className="size-4" />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <EmptyState
              icon={Bell}
              title={t("notifications.empty")}
            />
          )}
        </div>
      </div>
    </ContentColumn>
  );
}
