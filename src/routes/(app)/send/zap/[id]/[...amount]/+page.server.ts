import getRates from "$lib/rates";
import { auth, fd, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent }) {
  const { user } = await parent();
  const { amount, id } = params;
  const rates = await getRates();

  let request;
  if (amount) request = await post("/zapRequest", { amount, id }, auth(cookies));

  const rate = rates[user.currency];
  return { amount, id, rates, rate, request };
}

export const actions = {
  setAmount: async ({ cookies, params, request }) => {
    const data = await fd(request);
    const { id } = params;
    const { amount } = data;

    data.request = await post("/zapRequest", { amount, id }, auth(cookies));

    return data;
  },

  send: async ({ cookies, request }) => {
    let p;
    try {
      const body = await fd(request);

      p = await post("/payments", body, auth(cookies));
      console.log("P", p);
    } catch (_) {
      console.log("WHAT", _);
      return fail(400, { message: "payments.failedToRoute" });
    }

    redirect(307, `/sent/${p.id}`);
  },
};
