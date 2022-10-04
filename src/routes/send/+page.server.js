import validate from 'bitcoin-address-validation';
import bip21 from 'bip21';
import { get } from '$lib/utils';
import { invalid, redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const values = await request.formData();
		const t = values.get('text');
		console.log('parsing', t);
		if (!t) return;

		// lightning
		if (t.startsWith('ln')) {
			throw redirect(303, `/send/lightning/${t}`);
		}

		// bitcoin
		if (validate(t)) {
			console.log('bitcoin');
			throw redirect(303, `/send/bitcoin/${t}`);
		}

		// ln address
		if (t.includes('@') && t.includes('.')) {
			console.log('ln address');
			let [name, domain] = t.split('@');
			try {
				let lnurl = await get(`/encode?domain=${domain}&name=${name}`);
				console.log('lnurl', lnurl);
			} catch (e) {}
		}

		// user
		console.log('username');

		return invalid(403, { error: 'Failed to parse destination' });
	}
};
