import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { post } from "$lib/utils";

async function deriveKey(credentialId: string): Promise<ArrayBuffer> {
  const data = new TextEncoder().encode("coinos-wallet-key:" + credentialId);
  return crypto.subtle.digest("SHA-256", data);
}

function authHeader(token: string) {
  return { authorization: `Bearer ${token}` };
}

export async function registerPasskey(token?: string): Promise<ArrayBuffer> {
  const headers = token ? authHeader(token) : undefined;
  const options = await post("/passkey/register/options", {}, headers);
  const registration = await startRegistration({ optionsJSON: options });
  await post("/passkey/register/verify", registration, headers);
  return deriveKey(registration.id);
}

export async function loginWithPasskey(): Promise<{
  credential: any;
  challengeId: string;
  prfKey: ArrayBuffer;
}> {
  const { challengeId, ...options } = await post("/passkey/login/options", {});
  const authentication = await startAuthentication({ optionsJSON: options });
  const prfKey = await deriveKey(authentication.id);
  return { credential: authentication, challengeId, prfKey };
}
