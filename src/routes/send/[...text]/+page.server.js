import validate from 'bitcoin-address-validation';
import bip21 from 'bip21';
import { get } from '$lib/utils';
import { invalid, redirect } from '@sveltejs/kit';

let parse = async (t) => {
	if (!t) return;

	// lightning
	if (t.startsWith('ln')) {
		throw redirect(303, `/send/lightning/${t}`);
	}

	// bitcoin
	if (validate(t)) {
		let user;
		try {
			({ user } = await get(`/invoice/${t}`));
		} catch (e) {
			throw redirect(303, `/send/bitcoin/${t}`);
		}

		if (user) throw redirect(303, `/send/user/${user.username}`);
	}

	// ln address
	if (t.includes('@') && t.includes('.')) {
		let [name, domain] = t.split('@');
		try {
			let lnurl = await get(`/encode?domain=${domain}&name=${name}`);
		} catch (e) {}
	}

	// user
	let user;
	try {
		user = await get(`/users/${t}`);
	} catch (e) {}

	if (user) throw redirect(303, `/send/user/${t}`);
};

export async function load({ params }) {
  let { text } = params;
  await parse(text);
}

export const actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		await parse(form.get('text'));

		return invalid(403, { error: 'Failed to recognize input' });
	}
};
