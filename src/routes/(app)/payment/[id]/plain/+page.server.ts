import { auth, get } from "$lib/utils";

export async function load({ cookies, params }) {
  const payment = await get(`/payments/${params.id}`, auth(cookies));
  return { payment };
}
