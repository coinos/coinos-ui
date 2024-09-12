import { get, auth } from "$lib/utils";

export let load = async ({ cookies }) => {
  let account = cookies.get("account");
  let { payments } = await get(`/payments?account=${account}`, auth(cookies));
  return { payments };
};
