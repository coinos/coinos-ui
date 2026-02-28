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

  return ipStore.run(ip, () => resolve(event));
};
