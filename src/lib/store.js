import { get, writable } from 'svelte/store';
import { browser } from '$app/env';

const persistSession = (k, i) => {
	let s = writable(
		browser && sessionStorage.getItem(k) && sessionStorage.getItem(k) !== 'undefined'
			? JSON.parse(sessionStorage.getItem(k))
			: i
	);

	s.subscribe((v) => browser && sessionStorage.setItem(k, JSON.stringify(v)));

	return s;
};

const persistLocal = (k, i) => {
	let s = writable(
		browser && localStorage.getItem(k) && localStorage.getItem(k) !== 'undefined'
			? JSON.parse(localStorage.getItem(k))
			: i
	);

	s.subscribe((v) => browser && localStorage.setItem(k, JSON.stringify(v)));

	return s;
};

export const rate = writable();
export const user = writable();
export const invoiceAmount = writable();
export const invoiceAmountFiat = writable();
export const token = persistSession('token');
export const invoices = writable({});
export const preferredCurrency = writable();
export const newPayment = persistLocal();
export const colorTheme = writable('from-primary to-gradient');
