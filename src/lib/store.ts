import { browser } from "$app/environment";
import { writable } from "svelte/store";

const persistSession = (key, defaultValue = undefined) => {
	const s = writable(
		browser &&
		sessionStorage.getItem(key) &&
		sessionStorage.getItem(key) !== "undefined"
			? JSON.parse(sessionStorage.getItem(key) || "")
			: defaultValue,
	);

	s.subscribe((v) => {
		browser && sessionStorage.setItem(key, JSON.stringify(v));
	});

	return s;
};

const persistLocal = (key, defaultValue: any = undefined) => {
	const s = writable(
		browser &&
		localStorage.getItem(key) &&
		localStorage.getItem(key) !== "undefined"
			? JSON.parse(localStorage.getItem(key) || "")
			: defaultValue,
	);

	s.subscribe((v) => {
		try {
			browser && localStorage.setItem(key, JSON.stringify(v));
		} catch (e) {
			console.log("problem setting key", v);
			console.log(e);
		}
	});

	return s;
};

export const account = writable();
export const amountPrompt = persistLocal("amountPrompt");
export const avatar = writable();
export const banner = writable();
export const event = writable();
export const events = writable({});
export const installPrompt = writable();
export const invoice = writable();
export const last = writable();
export const loginRedirect = writable();
export const decrypted = persistLocal("decrypted", {});
export const mnemonic = persistSession("mnemonic");
export const newPayment = persistLocal("newPayment");
export const password = writable<string | undefined>();
export const passwordPrompt = writable();
export const pin = persistLocal("pin");
export const rate = writable();
export const request = writable();
export const requestRedirect = writable();
export const theme = writable("light");
export const token = persistSession("token");
export const ndef = writable();
export const showQr = persistLocal("showQr", true);
export const save = writable();
