import { get, auth } from "$lib/utils";

export let load = async ({ cookies }) => {
  let aid = cookies.get("aid");
  let { payments } = await get(`/payments?aid=${aid}`, auth(cookies));
  return { payments };
};
