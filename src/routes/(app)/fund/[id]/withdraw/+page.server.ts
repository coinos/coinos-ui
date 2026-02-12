import getRates from "$lib/rates";
import { auth, fd, get, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ params, parent }) {
  const { user } = await parent();
  if (!user) redirect(307, "/register");
  const rates = await getRates();
  const rate = rates[user.currency];
  const fund = await get(`/fund/${params.id}`);
  const { amount: balance } = fund;
  return { ...params, balance, rate };
}

export const actions = {
  default: async ({ cookies, request }) => {
    const body = await fd(request);
    try {
      await post("/take", body, auth(cookies));
    } catch (e) {
      const { message } = e as Error;
      return fail(400, { message });
    }

    redirect(307, `/fund/${body.id}`);
  },
};
