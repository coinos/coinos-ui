import { browser } from "$app/environment";
import { writable } from "svelte/store";

const PASSWORD_KEY = "walletPassword";
const EXPIRES_KEY = "walletPasswordExpiresAt";

export const rememberForOptions = [
  { label: "user.settings.dontRemember", ms: 0 },
  { label: "user.settings.8hours", ms: 8 * 60 * 60 * 1000 },
  { label: "user.settings.1day", ms: 24 * 60 * 60 * 1000 },
  { label: "user.settings.1week", ms: 7 * 24 * 60 * 60 * 1000 },
  { label: "user.settings.1month", ms: 30 * 24 * 60 * 60 * 1000 },
  { label: "user.settings.1year", ms: 365 * 24 * 60 * 60 * 1000 },
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

// PRF key cache
const PRF_KEY = "prfKey";
const PRF_EXPIRES_KEY = "prfKeyExpiresAt";

function hexFromBuffer(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bufferFromHex(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return bytes.buffer;
}

export const rememberPrfKey = (key: ArrayBuffer, durationMs: number) => {
  if (!browser) return;
  const expiresAt = Date.now() + durationMs;
  localStorage.setItem(PRF_KEY, hexFromBuffer(key));
  localStorage.setItem(PRF_EXPIRES_KEY, String(expiresAt));
};

export const getCachedPrfKey = (): ArrayBuffer | null => {
  if (!browser) return null;
  const hex = localStorage.getItem(PRF_KEY);
  if (!hex) return null;
  const expiresAtRaw = localStorage.getItem(PRF_EXPIRES_KEY);
  const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : 0;
  if (expiresAt && Date.now() > expiresAt) {
    forgetPrfKey();
    return null;
  }
  return bufferFromHex(hex);
};

export const forgetPrfKey = () => {
  if (!browser) return;
  localStorage.removeItem(PRF_KEY);
  localStorage.removeItem(PRF_EXPIRES_KEY);
};
