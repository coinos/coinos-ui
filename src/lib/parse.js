// import bolt11 from 'bolt11';
import validate from 'bitcoin-address-validation';
import bip21 from 'bip21';
import { get } from '$lib/utils';
import { goto } from '$app/navigation';

let debounce;
export default async (text) => {
	if (!text) return;
	console.log('parsing');

	// lightning
	if (text.startsWith('ln')) {
		try {
			console.log('lightning');
		} catch (e) {}
	}

	// bitcoin
	if (validate(text)) {
		console.log('bitcoin');
		goto(`/send/bitcoin/${text}`);
	}

	// ln address
	if (text.includes('@') && text.includes('.')) {
		console.log('ln address');
		let [name, domain] = text.split('@');
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
