import { fd, auth, get, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export let load = async ({ cookies, params: { id } }) => {
  let item = await get(`/items/${id}`);
  return { item };
};

export const actions = {
  default: async ({ cookies, request, url }) => {
    let form = await fd(request);
    try {
      await post(`/items`, form, auth(cookies));
    } catch (e) {
      return fail(400, { message: e.message });
    }

    let success = `/${url.pathname.split("/")[1]}`;
    redirect(307, success);
  },
};
