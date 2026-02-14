import { error, redirect } from "@sveltejs/kit";
import { auth, get, post, fd } from "$lib/utils";
import getRates from "$lib/rates";

export const load = async ({ cookies, params }) => {
  const account = await get(`/account/${params.id}`, auth(cookies));
  const rates = await getRates();
  return { account, rates };
};

export const actions = {
  default: async ({ cookies, params, request }) => {
    const { id } = params;
    const body = await fd(request);
    const username = cookies.get("username");

    body.autowithdraw = body.autowithdraw === "on";
    if (body.threshold) body.threshold = parseInt(body.threshold);
    if (body.reserve) body.reserve = parseInt(body.reserve);

    try {
      await post(`/account/${id}`, body, auth(cookies));
    } catch (e: any) {
      console.log(e);
      error(400, { message: e.message });
    }

    redirect(303, `/${username}`);
  },
};
