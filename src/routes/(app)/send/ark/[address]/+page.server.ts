import getRates from "$lib/rates";
import { auth, get } from "$lib/utils";

export async function load({ cookies, parent, url }) {
  const { user } = await parent();
  const rates = await getRates();
  let aid = url.searchParams.get("aid") || cookies.get("aid") || user.id;
  let account = await get(`/account/${aid}`, auth(cookies));

  // Fall back to custodial if cookie points to ark account
  if (account.type === "ark" && aid !== user.id) {
    aid = user.id;
    account = await get(`/account/${aid}`, auth(cookies));
    cookies.set("aid", aid, { path: "/", maxAge: 86400, httpOnly: false });
  }

  return { balance: account.balance, rate: rates[user.currency] };
}
