import validate from 'bitcoin-address-validation';
import bip21 from 'bip21';
import { auth, get, post } from '$lib/utils';
import { invalid, redirect } from '@sveltejs/kit';

let parse = async (t, host) => {
	if (!t) return;

	let amount, user, uuid;

	t.startsWith('bitcoin:') &&
		({
			address: t,
			options: { amount }
		} = bip21.decode(t));

	// ln address
	if (t.includes('@') && t.includes('.')) {
		let [name, domain] = t.split('@');
		if (domain === host) t = name;
		else {
			try {
				t = await get(`/encode?domain=${domain}&name=${name}`);
			} catch (e) {}
		}
	}

  if (t.includes("/voucher")) throw redirect(307, t.substring(t.indexOf('/voucher')));

	if (t.toLowerCase().startsWith('lnurl')) throw redirect(307, `/ln/${t}`);
	if (t.includes(':')) t = t.split(':')[1];

	// lightning
	if (t.startsWith('ln')) {
		try {
			({ uuid } = await get(`/invoice/${t}`));
		} catch (e) {
			throw redirect(307, `/send/lightning/${t}`);
		}

		if (uuid) throw redirect(307, `/send/${uuid}`);
	}

	// bitcoin
	if (validate(t)) {
		try {
			({ uuid } = await get(`/invoice/${t}`));
		} catch (e) {
			let r = `/send/bitcoin/${t}`;
			if (amount) r += '/' + amount;
			throw redirect(307, r);
		}

		if (uuid) throw redirect(307, `/send/${uuid}`);
	}

	// user
	try {
		user = await get(`/users/${t}`);
	} catch (e) {}

	if (user) throw redirect(307, `/send/user/${t}`);
};

export async function load({ cookies, params, request, url }) {
	let { text } = params;
	await parse(text, url.host);
	let contacts = await get('/contacts', auth(cookies));
	return { contacts };
}

export const actions = {
	default: async ({ request, url }) => {
		const form = await request.formData();
		await parse(form.get('text'), url.host);

		return invalid(403, { error: 'Does not compute, try again' });
	}
};
