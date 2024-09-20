import { auth, get } from "$lib/utils";

export async function load({ cookies }) {
  let account_id = cookies.get("account_id");
  let { balance } = await get(`/account/${account_id}`, auth(cookies));
  return { balance };
}
