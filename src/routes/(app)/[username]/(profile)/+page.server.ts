import getRates from "$lib/rates";
import { auth, get } from "$lib/utils";

export async function load({ cookies, depends, parent }) {
  depends("app:payments");
  depends("app:items");

  const { subject } = await parent();

  let accounts = [];
  if (cookies.get("token")) accounts = await get("/accounts", auth(cookies));

  const rates = await getRates();
  return { accounts, rate: rates[subject.currency] };
}
