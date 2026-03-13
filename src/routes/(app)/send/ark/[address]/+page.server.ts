import getRates from "$lib/rates";
import { auth, get } from "$lib/utils";

export async function load({ cookies, parent, url }) {
  const { user } = await parent();
  const rates = await getRates();
  let aid = url.searchParams.get("aid") || cookies.get("aid") || user.id;
  let account = await get(`/account/${aid}`, auth(cookies));

  return { balance: account.balance, rate: rates[user.currency] };
}
