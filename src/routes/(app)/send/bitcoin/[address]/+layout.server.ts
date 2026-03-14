import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent }) {
  const { user } = await parent();
  const aid = cookies.get("aid") || user.id;
  const { address } = params;
  const account = await get(`/account/${aid}`, auth(cookies));
  const senderIsVault = account.pubkey || account.seed;

  let invoice;
  try {
    invoice = await get(`/invoice/${address}`);
  } catch {
    // invoice not found
  }

  if (invoice && !senderIsVault) {
    const isVault = invoice.account?.pubkey || invoice.account?.seed;
    if (isVault) {
      // Vault account — stay on /send/bitcoin for on-chain send
    } else {
      // Custodial account — send internally via the original invoice
      if (invoice.uid !== user.id) redirect(303, `/send/invoice/${invoice.id}`);
    }
  }

  return { balance: account.balance };
}
