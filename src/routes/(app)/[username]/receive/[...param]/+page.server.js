import { auth, get } from "$lib/utils";
import invoice from "$lib/invoice";

export let load = async ({ cookies, params }) => {
  let id = params.param;

  let request;
  if (id) ({ request } = await get(`/request/${id}`, auth(cookies)));

  return { ...params, request };
};

export const actions = {
  default: invoice,
};
