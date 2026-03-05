import { ipStore } from "$lib/server/ip";
import { setIpGetter } from "$lib/utils";
import { redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit";

setIpGetter(() => ipStore.getStore());

export const handle: Handle = async ({ event, resolve }) => {
  let ip =
    event.request.headers.get("cf-connecting-ip") ||
    event.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  if (!ip) {
    try {
      ip = event.getClientAddress();
    } catch {
      ip = "127.0.0.1";
    }
  }

  // Sync aid cookie from URL params
  try {
    const aid = event.url.searchParams.get("aid");
    if (aid) event.cookies.set("aid", aid, { path: "/", maxAge: 86400, httpOnly: false });
  } catch {}


  // Auth check for (app) routes
  const isAppRoute = event.route.id?.startsWith("/(app)");
  const token = event.cookies.get("token");
  const { pathname } = event.url;
  const isSweep = pathname.match(/^\/fund\/[^/]+\/sweep/);
  const isLogout = pathname === "/logout";
  if (isLogout) {
    // Clear token before layout load to prevent infinite redirect loops
    event.cookies.set("token", "", { expires: new Date(0), path: "/" });
  } else if (isAppRoute && !token && !isSweep) {
    redirect(307, "/login");
  }

  return ipStore.run(ip, async () => {
    const response = await resolve(event);
    const { pathname } = event.url;
    const hasToken = event.cookies.get("token");

    if (!hasToken) {
      const cacheTTL: Record<string, number> = {
        "/": 300,
        "/bounties": 300,
        "/privacy": 86400,
        "/removal": 86400,
        "/forgot": 3600,
      };

      const ttl = cacheTTL[pathname];
      if (ttl) {
        response.headers.set("CDN-Cache-Control", `max-age=${ttl}`);
      }
    }

    return response;
  });
};
