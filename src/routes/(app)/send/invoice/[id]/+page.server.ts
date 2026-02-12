import getRates from "$lib/rates";
import { auth, fd, get, post, types } from "$lib/utils";
import { error, fail, redirect } from "@sveltejs/kit";

export async function load({ cookies, depends, params: { id }, parent }) {
  depends("app:trust");
  const { user } = await parent();
  const aid = cookies.get("aid") || user.id;
  const pin = cookies.get("pin");

  let invoice = await get(`/invoice/${id}`);

  const trust = await get("/trust", auth(cookies));
  const trusted = trust.includes(invoice.uid);
  if (trusted && (pin || !user.haspin)) {
    let p;
    try {
      if (!invoice.tip && invoice.user.prompt) {
        if (user.tip > 0) {
          invoice.tip = Math.round(invoice.amount * (user.tip / 100));
          invoice = await post(`/invoice/${id}`, { invoice }, auth(cookies));
        } else {
          throw new Error("tip");
        }
      }
      p = await post("/payments", { ...invoice, pin }, auth(cookies));
    } catch (e) {
      const { message } = e as Error;
      if (message === "tip") redirect(307, `/invoice/${id}/tip`);
      fail(400, { message });
    }
    if (p) redirect(307, `/sent/${p.id}`);
  }

  if (invoice.amount && invoice.prompt && invoice.tip === null) redirect(307, `/invoice/${id}/tip`);

  if (invoice.memoPrompt && invoice.memo === null) redirect(307, `/invoice/${id}/memo`);

  if (user && invoice.aid === aid) error(500, { message: "Cannot send to self" });
  else if (user && ![types.lightning, types.bolt12].includes(invoice.type))
    redirect(307, `/send/${invoice.type === types.ecash ? "ecash" : "bitcoin"}/${invoice.hash}`);

  if (!user) redirect(307, `/invoice/${id}`);

  const rates = await getRates();
  const rate = rates[user.currency];
  const invoiceRate = rates[invoice.currency];

  const { balance } = await get(`/account/${aid}`, auth(cookies));
  return { balance, invoice, user, rate, invoiceRate, trusted };
}

export const actions = {
  default: async ({ cookies, params: { id }, request }) => {
    let p;
    try {
      const body = await fd(request);
      body.hash = id;
      body.aid = cookies.get("aid");

      p = await post("/payments", body, auth(cookies));
    } catch (e) {
      const { message } = e as Error;
      console.log("payment failed", id, e);
      error(500, { message });
    }

    redirect(307, `/sent/${p.id}`);
  },
};
