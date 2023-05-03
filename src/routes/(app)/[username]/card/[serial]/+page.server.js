import { auth, get } from '$lib/utils';
import { redirect } from "@sveltejs/kit"

export let load = async ({ cookies, params }) => {
	let { serial } = params;
	let pot;
	try {
		pot = await get(`/pot/${serial}`, auth(cookies));
	} catch (e) {
		console.log(e);
	}

	console.log('POT', pot);

	if (pot) throw redirect(307, `/pot/${serial}`);

	return params;
};
