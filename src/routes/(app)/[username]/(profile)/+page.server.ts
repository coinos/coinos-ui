import { auth, get } from "$lib/utils";

export async function load({ cookies, depends, parent }) {
  depends("app:payments");
  depends("app:items");

  let { subject } = await parent();

  let accounts = await get("/accounts", auth(cookies));

  let items = await get(`/${subject.id}/items`, auth(cookies));
  items.map((i) => (i.quantity = 0));

  return { accounts, items };
}
