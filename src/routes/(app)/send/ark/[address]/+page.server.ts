import getRates from "$lib/rates";
import { auth, get } from "$lib/utils";

export async function load({ cookies, parent }) {
  const { user } = await parent();
  const rates = await getRates();
  const aid = cookies.get("aid") || user.id;
  const { balance } = await get(`/account/${aid}`, auth(cookies));
  return { balance, rate: rates[user.currency] };
}
