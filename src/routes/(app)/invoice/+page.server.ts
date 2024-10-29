import type { Invoice } from "$lib/types";
import { auth, post } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";

export const load = async ({ cookies, parent }) => {
	const aid = cookies.get("aid");
	let { subject, user, rates } = await parent();
	if (aid === user.id) redirect(307, `/${user.username}/receive`);

	let invoice: Invoice = {
		aid,
		rate: rates[user?.currency || subject?.currency],
	};

	if (!user) user = subject;

	try {
		invoice = await post("/invoice", { invoice, aid, user }, auth(cookies));
	} catch (e) {
		console.log(e);
		error(500, "Failed to generate invoice");
	}

	const { id } = invoice;

	if (invoice.memoPrompt && !invoice.memo) {
		redirect(307, `/invoice/${id}/memo`);
	} else redirect(307, `/invoice/${id}`);
};
