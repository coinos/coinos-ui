import { auth, fd, get, post, types } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";

export async function load({ cookies, params: { id }, parent }) {
	const aid = cookies.get("aid");
	const { rates, user } = await parent();

	const invoice = await get(`/invoice/${id}`);

	if (invoice.prompt && invoice.tip === null)
		redirect(307, `/invoice/${id}/tip`);

	if (invoice.memoPrompt && invoice.memo === null)
		redirect(307, `/invoice/${id}/memo`);

	if (invoice.aid === aid) error(500, { message: "Cannot send to self" });
	else if (user && invoice.type !== types.lightning) redirect(307, `/send/${invoice.type}/${invoice.hash}`);

	if (!user) redirect(307, `/invoice/${id}`);

	return { invoice, rates, user };
}

export const actions = {
	default: async ({ cookies, params: { id }, request }) => {
		let p;
		try {
			const body = await fd(request);
			body.hash = id;

			p = await post("/payments", body, auth(cookies));
		} catch (e: any) {
			console.log("payment failed", id, e);
			error(500, e.message);
		}

		redirect(307, `/sent/${p.id}`);
	},
};
