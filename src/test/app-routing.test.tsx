import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

describe("App routing", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it("matches a page for / instead of falling back to not found", () => {
    const matches = router.matchRoutes("/");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  const coreRoutes = [
    "/community",
    "/community/post/post-1",
    "/discover",
    "/places/place-1",
    "/saved",
    "/notifications",
    "/profile/me",
    "/profile/jasur",
    "/settings",
    "/create",
    "/login",
    "/register",
    "/forgot-password",
    "/auth",
    "/auth/callback",
  ];

  it.each(coreRoutes)("matches a route successfully for %s", (path) => {
    const matches = router.matchRoutes(path);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
