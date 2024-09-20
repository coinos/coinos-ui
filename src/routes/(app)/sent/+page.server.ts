import { get, auth } from "$lib/utils";

export let load = async ({ cookies }) => {
  let account_id = cookies.get("account_id");
  let { payments } = await get(`/payments?account_id=${account_id}`, auth(cookies));
  return { payments };
};
