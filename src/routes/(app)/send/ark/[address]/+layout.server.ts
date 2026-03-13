import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent, url }) {
  const { user } = await parent();
  let aid = url.searchParams.get("aid") || cookies.get("aid") || user.id;
  const { address, amount } = params;
  let account = await get(`/account/${aid}`, auth(cookies));

  let invoice;
  try {
    invoice = await get(`/invoice/${address}`);
  } catch {
    // invoice not found
  }

  if (invoice) {
    const recipient = await get(`/users/${invoice.uid}`);
    let r = `/pay/${recipient.username}`;
    if (amount) r += `/${amount}`;
    if (recipient?.id !== user.id && recipient.id === invoice.aid) redirect(307, r);
  }

  return { balance: account.balance };
}
