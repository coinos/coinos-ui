import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent, url }) {
  const { user } = await parent();
  let aid = url.searchParams.get("aid") || cookies.get("aid") || user.id;
  const { address, amount } = params;
  let account = await get(`/account/${aid}`, auth(cookies));

  // Fall back to custodial if cookie points to ark account
  if (account.type === "ark" && aid !== user.id) {
    aid = user.id;
    account = await get(`/account/${aid}`, auth(cookies));
    cookies.set("aid", aid, { path: "/", maxAge: 86400, httpOnly: false });
  }

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
