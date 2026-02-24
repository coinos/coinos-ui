export function isPrfEncrypted(value: string): boolean {
  return value.startsWith("{");
}

async function importPrfKey(prfKey: ArrayBuffer, usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", prfKey, "AES-GCM", false, usages);
}

export async function prfEncrypt(prfKey: ArrayBuffer, plaintext: Uint8Array): Promise<string> {
  const key = await importPrfKey(prfKey, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      (plaintext as Uint8Array).buffer as ArrayBuffer,
    ),
  );
  return JSON.stringify({
    v: 1,
    iv: toBase64Url(iv),
    ct: toBase64Url(ciphertext),
  });
}

export async function prfDecrypt(prfKey: ArrayBuffer, encrypted: string): Promise<Uint8Array> {
  const { iv, ct } = JSON.parse(encrypted);
  const key = await importPrfKey(prfKey, ["decrypt"]);
  const ivBytes = fromBase64Url(iv);
  const ctBytes = fromBase64Url(ct);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes.buffer as ArrayBuffer },
    key,
    ctBytes.buffer as ArrayBuffer,
  );
  return new Uint8Array(plaintext);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (s.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
