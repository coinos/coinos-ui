import { browser } from "$app/environment";
import { writable } from "svelte/store";

const PASSWORD_KEY = "walletPassword";
const EXPIRES_KEY = "walletPasswordExpiresAt";

export const rememberForOptions = [
	{ label: "Don't remember", ms: 0 },
	{ label: "8 hours", ms: 8 * 60 * 60 * 1000 },
	{ label: "1 day", ms: 24 * 60 * 60 * 1000 },
	{ label: "1 week", ms: 7 * 24 * 60 * 60 * 1000 },
	{ label: "1 month", ms: 30 * 24 * 60 * 60 * 1000 },
	{ label: "1 year", ms: 365 * 24 * 60 * 60 * 1000 },
];

export const defaultRememberForMs = 30 * 24 * 60 * 60 * 1000;

const clearStoredPassword = () => {
	if (!browser) return;
	localStorage.removeItem(PASSWORD_KEY);
	localStorage.removeItem(EXPIRES_KEY);
};

const loadStoredPassword = () => {
	if (!browser) return undefined;
	const password = localStorage.getItem(PASSWORD_KEY) || undefined;
	if (!password) return undefined;
	const expiresAtRaw = localStorage.getItem(EXPIRES_KEY);
	const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : undefined;
	if (expiresAt && Date.now() > expiresAt) {
		clearStoredPassword();
		return undefined;
	}
	return password;
};

export const walletPassword = writable<string | undefined>(loadStoredPassword());

export const rememberWalletPassword = (password: string, durationMs: number) => {
	if (!browser) return;
	if (!durationMs) {
		clearStoredPassword();
		walletPassword.set(undefined);
		return;
	}
	const expiresAt = Date.now() + durationMs;
	localStorage.setItem(PASSWORD_KEY, password);
	localStorage.setItem(EXPIRES_KEY, String(expiresAt));
	walletPassword.set(password);
};

export const forgetWalletPassword = () => {
	clearStoredPassword();
	walletPassword.set(undefined);
};

export const getRememberedWalletPassword = () => {
	const password = loadStoredPassword();
	walletPassword.set(password);
	return password;
};
