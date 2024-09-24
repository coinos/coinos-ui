import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent }) {
  let { user } = await parent();
  let aid = cookies.get("aid");
  let { address } = params;
  let { balance } = await get(`/account/${aid}`, auth(cookies));

  try {
    let invoice = await get(`/invoice/${address}`);

    if (invoice) {
      let recipient = await get(`/users/${invoice.uid}`);
      if (recipient?.id !== user.id)
        redirect(307, `/pay/${recipient.username}`);
    }
  } catch (e) {
    // invoice not found
  }

  return { balance };
}
