import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';

// creates a Svelte store synced to sessionStorage with the given key and default value
const persistSession = (key, defaultValue) => {
	let s = writable(
		browser && sessionStorage.getItem(key) && sessionStorage.getItem(key) !== 'undefined'
			? JSON.parse(sessionStorage.getItem(key))
			: defaultValue
	);

	s.subscribe((v) => browser && sessionStorage.setItem(key, JSON.stringify(v)));

	return s;
};

// creates a Svelte store synced to localStorage with the given key and default value
const persistLocal = (key, defaultValue) => {
	let s = writable(
		browser && localStorage.getItem(key) && localStorage.getItem(key) !== 'undefined'
			? JSON.parse(localStorage.getItem(key))
			: defaultValue
	);

	s.subscribe((v) => browser && localStorage.setItem(key, JSON.stringify(v)));

	return s;
};

export const rate = writable();
export const redirect = writable();
export const rates = writable();
export const selectedRate = writable();
export const user = writable();
export const subject = writable();
export const invoiceAmount = writable();
export const invoiceAmountFiat = writable();
export const token = persistSession('token');
export const invoices = writable({});
export const newPayment = persistLocal('newPayment');
export const colorTheme = writable('from-primary to-gradient');
export const tempProfileFiles = writable();
export const avatarUpload = writable();
export const bannerUpload = writable();
