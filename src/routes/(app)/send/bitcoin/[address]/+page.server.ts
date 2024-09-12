import { auth, get } from "$lib/utils";

export async function load({ cookies }) {
  let account = cookies.get("account");
  let { balance } = await get(`/account/${account}`, auth(cookies));
  return { balance };
}
