import { env } from "$env/dynamic/private";
import { PUBLIC_COINOS_URL } from "$env/static/public";
import { error, json } from "@sveltejs/kit";

let walletPromise: Promise<any> | undefined;

const getWallet = async () => {
  if (!walletPromise) {
    const privateKey = env.ARK_SERVER_WALLET_PRIVATE_KEY;
    const arkServerUrl = env.ARK_SERVER_URL || "http://localhost:7070";

    if (!privateKey) {
      throw new Error("ARK_SERVER_WALLET_PRIVATE_KEY is not configured");
    }

    const { SingleKey, Wallet } = await import("@arkade-os/sdk");
    const identity = SingleKey.fromHex(privateKey);
    walletPromise = Wallet.create({ identity, arkServerUrl });
  }

  return walletPromise;
};

export async function POST({ request, cookies, fetch }) {
  // Never expose this in production.
  if (env.NODE_ENV === "production") error(404, "Not found");

  // Require explicit opt-in for local/integration test environments.
  if (env.ENABLE_E2E_TEST_ENDPOINTS !== "true") {
    error(404, "Not found");
  }

  const expectedSecret = env.E2E_TEST_SECRET;
  const providedSecret = request.headers.get("x-test-secret");
  if (!expectedSecret || providedSecret !== expectedSecret) {
    error(401, "Unauthorized");
  }

  const body = await request.json();
  const address = String(body?.address || "").trim();
  const amount = Number(body?.amount || 1000);
  const iid = typeof body?.iid === "string" ? body.iid : undefined;

  if (!/^t?ark1[a-z0-9]+$/i.test(address)) {
    error(400, "Invalid ark address");
  }

  if (!Number.isInteger(amount) || amount <= 0 || amount > 1_000_000) {
    error(400, "Invalid amount");
  }

  const wallet = await getWallet();
  const txid = await wallet.sendBitcoin({ address, amount });

  // Optional: mark an Ark invoice as received right after send.
  if (iid) {
    const token = cookies.get("token");
    if (!token) error(401, "Missing auth token cookie");

    const response = await fetch(`${PUBLIC_COINOS_URL}/ark/receive`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ iid, amount, hash: txid }),
    });

    if (!response.ok) {
      error(response.status, await response.text());
    }
  }

  return json({ ok: true, txid, amount, address, iid: iid || null });
}
