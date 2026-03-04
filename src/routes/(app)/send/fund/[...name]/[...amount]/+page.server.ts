import getRates from "$lib/rates";
import { auth, fd, post, sats } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ parent, params }) {
  let { name, amount } = params;
  if (!name) name = crypto.randomUUID();
  const { user } = await parent();
  const rates = await getRates();
  const rate = rates[user.currency];
  return { name, amount, rate };
}

export const actions = {
  default: async ({ cookies, request }) => {
    const body = await fd(request);

    if (body.authorize === "true") {
      const rate = Number(body.rate);
      const fiat = parseFloat(((Number(body.amount) * rate) / sats).toFixed(2));
      try {
        await post("/authorize", { amount: body.amount, currency: body.currency, fiat, id: body.fund }, auth(cookies));
      } catch (e) {
        const { message } = e as Error;
        return fail(400, { message });
      }
      redirect(307, `/fund/${body.fund}`);
    }

    let p;
    try {
      p = await post("/payments", body, auth(cookies));
    } catch (e) {
      const { message } = e as Error;
      return fail(400, { message });
    }

    if (p) redirect(307, `/fund/${body.fund}`);
  },
};
