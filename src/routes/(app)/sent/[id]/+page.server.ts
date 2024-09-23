import { get, auth } from "$lib/utils";

export let load = async ({ cookies, params }) => {
  let { id } = params;
    let p  = await get(`/payments/${id}`, auth(cookies));
  return p;
};
