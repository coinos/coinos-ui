import { get, auth } from "$lib/utils";

export let load = async ({ cookies }) => {
  let { payments } = await get("/payments", auth(cookies));
  return { payments };
};
