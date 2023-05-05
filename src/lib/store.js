import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';

const persistSession = (key, defaultValue) => {
	let s = writable(
		browser && sessionStorage.getItem(key) && sessionStorage.getItem(key) !== 'undefined'
			? JSON.parse(sessionStorage.getItem(key))
			: defaultValue
	);

	s.subscribe((v) => browser && sessionStorage.setItem(key, JSON.stringify(v)));

	return s;
};

const persistLocal = (key, defaultValue) => {
	let s = writable(
		browser && localStorage.getItem(key) && localStorage.getItem(key) !== 'undefined'
			? JSON.parse(localStorage.getItem(key))
			: defaultValue
	);

	s.subscribe((v) => {
		try {
			browser && localStorage.setItem(key, JSON.stringify(v));
		} catch (e) {
			console.log('problem setting key', v);
			console.log(e);
		}
	});

	return s;
};

export const animatedRate = persistLocal('rate', 0);
export const avatar = writable();
export const banner = writable();
export const colorTheme = writable('from-primary to-gradient');
export const event = writable();
export const events = writable({});
export const invoice = writable();
export const last = writable();
export const loginRedirect = writable();
export const decrypted = persistLocal('decrypted', {});
export const newPayment = persistLocal('newPayment');
export const password = persistLocal('password');
export const passwordPrompt = writable();
export const payments = persistLocal('transactions', []);
export const pin = writable();
export const rate = writable();
export const request = writable();
export const requestRedirect = writable();
export const token = persistSession('token');
export const user = writable();
export const ndef = writable();
