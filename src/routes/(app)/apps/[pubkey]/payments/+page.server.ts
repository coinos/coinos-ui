import { auth, get } from "$lib/utils";

export const load = async ({ cookies, params }) => {
	const app = await get(`/app/${params.pubkey}`, auth(cookies));
	return { app };
};
