import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { post } from "$lib/utils";

async function deriveKey(credentialId: string): Promise<ArrayBuffer> {
  const data = new TextEncoder().encode("coinos-wallet-key:" + credentialId);
  return crypto.subtle.digest("SHA-256", data);
}

function authHeader(token: string) {
  return { authorization: `Bearer ${token}` };
}

export async function registerPasskey(
  token?: string,
): Promise<{ prfKey: ArrayBuffer; credentialId: string }> {
  const headers = token ? authHeader(token) : undefined;
  const origin = window.location.origin;
  const options = await post("/passkey/register/options", { origin }, headers);
  const registration = await startRegistration({ optionsJSON: options });
  await post("/passkey/register/verify", { ...registration, origin }, headers);
  const prfKey = await deriveKey(registration.id);
  return { prfKey, credentialId: registration.id };
}

export async function loginWithPasskey(): Promise<{
  credential: any;
  challengeId: string;
  prfKey: ArrayBuffer;
}> {
  const origin = window.location.origin;
  const { challengeId, ...options } = await post("/passkey/login/options", { origin });
  const authentication = await startAuthentication({ optionsJSON: options });
  const prfKey = await deriveKey(authentication.id);
  return { credential: authentication, challengeId, prfKey };
}
