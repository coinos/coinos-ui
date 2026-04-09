import { startRegistration } from "@simplewebauthn/browser";
import { post } from "$lib/utils";

const PRF_SALT = new TextEncoder().encode("coinos-wallet-key");

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const padded =
    base64url.replace(/-/g, "+").replace(/_/g, "/") +
    "==".slice(0, (4 - (base64url.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer as ArrayBuffer;
}

async function deriveKeyLegacy(credentialId: string): Promise<ArrayBuffer> {
  const data = new TextEncoder().encode("coinos-wallet-key:" + credentialId);
  return crypto.subtle.digest("SHA-256", data);
}

async function evaluatePrf(credentialId: string): Promise<ArrayBuffer | null> {
  try {
    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [
          { id: base64urlToBuffer(credentialId), type: "public-key" as const },
        ],
        extensions: { prf: { eval: { first: PRF_SALT } } } as any,
        userVerification: "required",
      },
    })) as PublicKeyCredential;

    const results = (assertion.getClientExtensionResults() as any).prf?.results;
    return results?.first || null;
  } catch {
    return null;
  }
}

function authHeader(token: string) {
  return { authorization: `Bearer ${token}` };
}

export async function registerPasskey(
  token?: string,
): Promise<{ prfKey: ArrayBuffer; credentialId: string; prfSupported: boolean }> {
  const headers = token ? authHeader(token) : undefined;
  const origin = window.location.origin;
  const options = await post("/passkey/register/options", { origin }, headers);
  const registration = await startRegistration({ optionsJSON: options });
  await post("/passkey/register/verify", { ...registration, origin }, headers);

  // Try PRF evaluation with an immediate get() after registration
  const prfResult = await evaluatePrf(registration.id);
  if (prfResult) {
    return { prfKey: prfResult, credentialId: registration.id, prfSupported: true };
  }

  // Fallback to legacy SHA-256(credentialId)
  const legacyKey = await deriveKeyLegacy(registration.id);
  return { prfKey: legacyKey, credentialId: registration.id, prfSupported: false };
}

export async function loginWithPasskey(): Promise<{
  credential: any;
  challengeId: string;
  prfKey: ArrayBuffer;
  legacyKey: ArrayBuffer;
}> {
  const origin = window.location.origin;
  const { challengeId, ...options } = await post("/passkey/login/options", { origin });

  // Convert options from JSON to WebAuthn API format
  const publicKeyOptions: PublicKeyCredentialRequestOptions = {
    challenge: base64urlToBuffer(options.challenge),
    rpId: options.rpId,
    timeout: options.timeout,
    userVerification: (options.userVerification as UserVerificationRequirement) || "required",
    allowCredentials: options.allowCredentials?.map((c: any) => ({
      id: base64urlToBuffer(c.id),
      type: c.type as PublicKeyCredentialType,
      transports: c.transports,
    })),
    extensions: {
      prf: { eval: { first: PRF_SALT } },
    } as any,
  };

  const assertion = (await navigator.credentials.get({
    publicKey: publicKeyOptions,
  })) as PublicKeyCredential;

  const response = assertion.response as AuthenticatorAssertionResponse;

  // Serialize response in the format the server expects (same as simplewebauthn)
  const credential = {
    id: assertion.id,
    rawId: bufferToBase64url(assertion.rawId),
    response: {
      authenticatorData: bufferToBase64url(response.authenticatorData),
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
      signature: bufferToBase64url(response.signature),
      userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
    },
    type: assertion.type,
    clientExtensionResults: {},
    authenticatorAttachment: (assertion as any).authenticatorAttachment || null,
  };

  // Extract PRF result
  const prfResults = (assertion.getClientExtensionResults() as any).prf?.results;
  const prfOutput: ArrayBuffer | null = prfResults?.first || null;

  // Compute legacy key for migration
  const legacyKey = await deriveKeyLegacy(assertion.id);

  // Use PRF output if available, otherwise fall back to legacy
  const prfKey = prfOutput || legacyKey;

  return { credential, challengeId, prfKey, legacyKey };
}
