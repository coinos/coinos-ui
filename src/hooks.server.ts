import { ipStore } from "$lib/server/ip";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const ip =
		event.request.headers.get("cf-connecting-ip") ||
		event.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		event.getClientAddress();

	return ipStore.run(ip, () => resolve(event));
};
