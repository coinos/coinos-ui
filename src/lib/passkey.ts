import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { post } from "$lib/utils";

export async function registerPasskey() {
  const options = await post("/passkey/register/options", {});
  const registration = await startRegistration({ optionsJSON: options });
  await post("/passkey/register/verify", registration);
}

export async function loginWithPasskey() {
  const { challengeId, ...options } = await post("/passkey/login/options", {});
  const authentication = await startAuthentication({ optionsJSON: options });
  return { credential: authentication, challengeId };
}
