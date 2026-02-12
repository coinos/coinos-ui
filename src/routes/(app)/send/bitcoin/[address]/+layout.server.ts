import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent }) {
  const { user } = await parent();
  const aid = cookies.get("aid") || user.id;
  const { address, amount } = params;
  const { balance } = await get(`/account/${aid}`, auth(cookies));

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
    if (recipient?.id !== user.id) redirect(307, r);
  }

  return { balance };
}
