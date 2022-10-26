import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';

const persistSession = (key, defaultValue, expiry) => {
	if (expiry && browser && new Date() - expiry > sessionStorage.getItem(key + 'time')) {
		sessionStorage.removeItem(key);
	}

	let s = writable(
		browser && sessionStorage.getItem(key) && sessionStorage.getItem(key) !== 'undefined'
			? JSON.parse(sessionStorage.getItem(key))
			: defaultValue
	);

	expiry && browser && sessionStorage.setItem(key + 'time', Date.now());

	s.subscribe((v) => browser && sessionStorage.setItem(key, JSON.stringify(v)));

	return s;
};

const persistLocal = (key, defaultValue) => {
	let s = writable(
		browser && localStorage.getItem(key) && localStorage.getItem(key) !== 'undefined'
			? JSON.parse(localStorage.getItem(key))
			: defaultValue
	);

	s.subscribe((v) => browser && localStorage.setItem(key, JSON.stringify(v)));

	return s;
};

export const loginRedirect = writable();
export const rate = writable();
export const user = writable();
export const selectedRate = writable();
export const token = persistSession('token');
export const invoices = writable({});
export const newPayment = persistLocal('newPayment');
export const colorTheme = writable('from-primary to-gradient');
export const tempProfileFiles = writable();
export const avatarUpload = writable();
export const bannerUpload = writable();
export const pin = persistSession('pin', undefined, 5 * 60 * 1000);
