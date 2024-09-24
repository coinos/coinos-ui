import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, params }) {
  let aid = cookies.get("aid");
  let { address } = params;
  let { balance } = await get(`/account/${aid}`, auth(cookies));
  let invoice = await get(`/invoice/${address}`);
  let recipient = await get(`/user/${invoice.uid}`);
  if (invoice.aid === invoice.uid) redirect(307, `/send/${recipient.username}`);
  return { balance };
}
