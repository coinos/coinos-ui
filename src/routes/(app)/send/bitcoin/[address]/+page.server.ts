import { auth, get } from "$lib/utils";

export async function load({ cookies }) {
  let aid = cookies.get("aid");
  let { balance } = await get(`/account/${aid}`, auth(cookies));
  return { balance };
}
