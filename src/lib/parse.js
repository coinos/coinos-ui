// import bolt11 from 'bolt11';
import validate from 'bitcoin-address-validation';
import bip21 from 'bip21';
import { get } from '$lib/utils';
import { goto } from '$app/navigation';

let debounce;
export default async (t) => {
	if (!t) return;
	console.log('parsing');

	// lightning
	if (t.startsWith('ln')) {
		goto(`/send/lightning/${t}`);
	}

	// bitcoin
	if (validate(t)) {
		console.log('bitcoin');
		goto(`/send/bitcoin/${t}`);
	}

	// ln address
	if (t.includes('@') && t.includes('.')) {
		console.log('ln address');
		let [name, domain] = t.split('@');
		try {
			clearTimeout(debounce);
			await new Promise((r) => (debounce = setTimeout(r, 1500)));
			let lnurl = await get(`/encode?domain=${domain}&name=${name}`);
			console.log('lnurl', lnurl);
		} catch (e) {}
	}

	// user
	console.log('username');
};
