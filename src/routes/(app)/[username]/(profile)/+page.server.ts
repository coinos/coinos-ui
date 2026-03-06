import getRates from "$lib/rates";
import { auth, get } from "$lib/utils";

export async function load({ cookies, depends }) {
  depends("app:payments");
  depends("app:items");

  let accounts = [];
  if (cookies.get("token")) accounts = await get("/accounts", auth(cookies));

  const rates = await getRates();
  return { accounts, rates };
}
