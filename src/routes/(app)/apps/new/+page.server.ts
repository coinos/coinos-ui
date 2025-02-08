import getRates from "$lib/rates";
import { auth, fd, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ parent, url }) => {
	const app = {
		name: url.searchParams.get("name"),
		pubkey: url.searchParams.get("pubkey"),
		max_amount: url.searchParams.get("max_amount"),
		budget_renewal: url.searchParams.get("budget_renewal"),
	};

	const { user } = await parent();
	const rates = await getRates();
	const rate = rates[user.currency];
	return { app, rate };
};

export const actions = {
	default: async ({ cookies, request }) => {
		try {
			const body = await fd(request);
			await post("/app", body, auth(cookies));
		} catch (e) {
			const { message: error } = e as Error;
			return fail(400, { error });
		}

		redirect(307, "/settings/nostr");
	},
};
