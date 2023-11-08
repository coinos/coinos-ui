import { auth, get } from '$lib/utils';
import { redirect } from "@sveltejs/kit"

export let load = async ({ cookies, params }) => {
	let { serial } = params;
	let fund;
	try {
		fund = await get(`/fund/${serial}`, auth(cookies));
	} catch (e) {
		console.log(e);
	}

	if (fund) throw redirect(307, `/fund/${serial}`);

	return params;
};
