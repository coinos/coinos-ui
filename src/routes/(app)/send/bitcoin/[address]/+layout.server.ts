import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent }) {
	const { user } = await parent();
	const aid = cookies.get("aid");
	const { address } = params;
	const { balance } = await get(`/account/${aid}`, auth(cookies));

	try {
		const invoice = await get(`/invoice/${address}`);

		if (invoice) {
			const recipient = await get(`/users/${invoice.uid}`);
			if (recipient?.id !== user.id)
				redirect(307, `/pay/${recipient.username}`);
		}
	} catch (e) {
		// invoice not found
	}

	return { balance };
}
