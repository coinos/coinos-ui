import { ipStore } from "$lib/server/ip";
import { setIpGetter } from "$lib/utils";
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
