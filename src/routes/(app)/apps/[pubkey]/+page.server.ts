import getRates from "$lib/rates";
import { auth, fd, get, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ cookies, params, parent }) => {
  const { pubkey } = params;
  const { user } = await parent();
  const rates = await getRates();
  const rate = rates[user.currency];
  const app = await get(`/app/${pubkey}`, auth(cookies));
  return { app, rate };
};

export const actions = {
  default: async ({ cookies, request }) => {
    try {
      const body = await fd(request);
      await post("/app", body, auth(cookies));
    } catch (e) {
      const { message: error } = e as Error;
      return fail(400, { error });
    }

    redirect(307, "/settings/nostr");
  },
};
