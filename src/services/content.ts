/**
 * Content repository boundary. V1 reads typed demo seed data; a future API
 * adapter implements the same interface (see FRONTEND_HANDOFF.md).
 */
import { demoComments, demoNotifications, demoPosts } from "@/demo/posts";
import { demoPeople } from "@/demo/people";
import { demoPlaces } from "@/demo/places";
import type { Comment, CommunityPost, DemoNotification, Person, Place } from "@/domain/types";

export interface ContentRepository {
  listPosts(): CommunityPost[];
  listPlaces(): Place[];
  listPeople(): Person[];
  listComments(): Comment[];
  listNotifications(): DemoNotification[];
}

export const demoRepository: ContentRepository = {
  listPosts: () => demoPosts,
  listPlaces: () => demoPlaces,
  listPeople: () => demoPeople,
  listComments: () => demoComments,
  listNotifications: () => demoNotifications,
};
