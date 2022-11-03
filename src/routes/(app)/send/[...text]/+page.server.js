import validate from 'bitcoin-address-validation';
import bip21 from 'bip21';
import { get, post } from '$lib/utils';
import { invalid, redirect } from '@sveltejs/kit';

let parse = async (t) => {
	if (!t) return;
	let user, uuid;

	// lightning
	if (t.startsWith('ln')) {
		try {
			({ uuid } = await get(`/invoice/${t}`));
		} catch (e) {
			throw redirect(303, `/send/lightning/${t}`);
		}

		if (uuid) throw redirect(303, `/send/${uuid}`);
	}

	// bitcoin
	if (validate(t)) {
		try {
			({ uuid } = await get(`/invoice/${t}`));
		} catch (e) {
			throw redirect(303, `/send/bitcoin/${t}`);
		}

		if (uuid) throw redirect(303, `/send/${uuid}`);
	}

	// ln address
	if (t.includes('@') && t.includes('.')) {
		let [name, domain] = t.split('@');
		try {
			let lnurl = await get(`/encode?domain=${domain}&name=${name}`);
		} catch (e) {}
	}

	// user
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

		return invalid(403, { error: 'Does not compute, try again' });
	}
};
