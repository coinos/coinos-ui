import { browser } from "$app/environment";

// PRF key cache
const PRF_KEY = "prfKey";
const PRF_EXPIRES_KEY = "prfKeyExpiresAt";

export const defaultRememberForMs = 30 * 24 * 60 * 60 * 1000;

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
