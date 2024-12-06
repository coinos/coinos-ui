import getRates from "$lib/rates";
import { auth, fd, post } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";

export async function load({ parent }) {
	const rates = await getRates();
	const { user } = await parent();
	return { rate: rates[user.currency] };
}

export const actions = {
	default: async ({ cookies, request }) => {
		let id;
		const body = await fd(request);

		try {
			({ id } = await post("/mint", body, auth(cookies)));
		} catch (e) {
			const { message } = e as Error;
			console.log("problem creating ecash", e);
			error(400, { message });
		}

		redirect(307, `/ecash/${id}`);
	},
};
