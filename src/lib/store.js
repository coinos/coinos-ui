import { get, writable } from 'svelte/store';
import { browser } from '$app/env';

const persisted = (k, i) => {
	let s = writable(
		browser && sessionStorage.getItem(k) && sessionStorage.getItem(k) !== 'undefined'
			? JSON.parse(sessionStorage.getItem(k))
			: i
	);

	s.subscribe((v) => browser && sessionStorage.setItem(k, JSON.stringify(v)));

	return s;
};

export const rate = writable();
export const user = writable();
export const invoiceAmount = writable();
export const invoiceAmountFiat = writable();
export const token = persisted('token');
export const invoices = writable({});
export const preferredCurrency = writable();
export const newPayment = writable();
export const colorTheme = writable('from-primary to-gradient');
