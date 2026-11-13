import { demoRepository } from "@/services/content";
import { useDemo } from "@/state/demo-store";

export function useUnreadCount() {
  const { state } = useDemo();
  return demoRepository.listNotifications().filter((n) => !state.readNotifications.includes(n.id)).length;
}
