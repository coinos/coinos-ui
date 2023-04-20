import { validate } from 'bitcoin-address-validation';
import bip21 from 'bip21';
import { auth, get, post } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import { PUBLIC_DOMAIN } from '$env/static/public';

let parse = async (t, host) => {
	if (!t) return;

	if (t.startsWith('http')) throw redirect(307, t);

	let amount, user, id;

	t = t.trim();
	t.toLowerCase().startsWith('bitcoin:') &&
		({
			address: t,
			options: { amount }
		} = bip21.decode(t));

	if (t.endsWith(`@${PUBLIC_DOMAIN}`)) t = t.split('@')[0];
	if (t.includes('@') && t.includes('.')) {
		try {
			t = await get(`/encode?address=${t}`);
		} catch (e) {}
	}

	if (t.endsWith('@classic')) {
		({ uuid: id } = await get(`/invoice/classic/${t.replace('@classic', '')}`));
		if (id) throw redirect(307, `/send/invoice/${id}`);
	}

	if (t.includes('/pot')) throw redirect(307, t.substring(t.indexOf('/pot')));

	if (t.toLowerCase().startsWith('lnurl')) throw redirect(307, `/ln/${t}`);
	if (t.includes(':')) t = t.split(':')[1];

	// lightning
	if (t.toLowerCase().startsWith('ln')) {
		try {
			({ id } = await get(`/invoice/${t}`));
		} catch (e) {
			throw redirect(307, `/send/lightning/${t}`);
		}

		if (id) throw redirect(307, `/send/${id}`);
	}

	// bitcoin
	if (validate(t)) {
		try {
			({ id, user } = await get(`/invoice/${t}`));
		} catch (e) {
			let r = `/send/bitcoin/${t}`;
			if (amount) r += '/' + amount;
			throw redirect(307, r);
		}

		if (user) throw redirect(307, `/send/${user.username}`);
		else if (id) throw redirect(307, `/send/${id}`);
	}

	// user
	try {
		user = await get(`/users/${t}`);
		if (user.anon) user = null;
	} catch (e) {}

	if (user) throw redirect(307, `/send/user/${t}`);

	// pot
	let pot;
	try {
		pot = await get(`/pot/${t}`);
	} catch (e) {}

	if (pot) throw redirect(307, `/send/pot/${t}`);

	// invoice
	let invoice;
	try {
		invoice = await get(`/invoice/${t}`);
	} catch (e) {}

	if (invoice) throw redirect(307, `/send/invoice/${invoice.hash}`);
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
		let t = form.get('text');
		await parse(t, url.host);
		return fail(400, { error: true });
	}
};
