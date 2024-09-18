import { error, redirect } from "@sveltejs/kit";
import { auth, get, post, fd } from "$lib/utils";


export let load = async ({ cookies, params }) => {
  let account = await get(`/account/${params.id}`, auth(cookies));
  return { account };
}

export const actions = {
  default: async ({ cookies, params, request }) => {
    let { id } = params;
    let body = await fd(request);
    let username = cookies.get("username");

    try {
      await post(`/account/${id}`, body, auth(cookies));
    } catch (e: any) {
      console.log(e);
      error(400, { message: e.message });
    }

    redirect(303, `/${username}`);
  },
};
