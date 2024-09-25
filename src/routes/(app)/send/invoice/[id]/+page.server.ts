import { error, redirect } from "@sveltejs/kit";
import { fd, auth, get, post } from "$lib/utils";

export async function load({ params: { id }, parent }) {
  let { rates, user } = await parent();

  let invoice = await get(`/invoice/${id}`);

  if (invoice.prompt && invoice.tip === null)
    redirect(307, `/invoice/${id}/tip`);

  if (invoice.memoPrompt && invoice.memo === null)
    redirect(307, `/invoice/${id}/memo`);

  if (invoice.account === user?.id)
    error(500, { message: "Cannot send to self" });

  if (!user) redirect(307, `/invoice/${id}`);

  return { invoice, rates, user };
}

export const actions = {
  default: async ({ cookies, params: { id }, request }) => {
    let p;
    try {
      let body = await fd(request);
      body.hash = id;

      p = await post("/payments", body, auth(cookies));
    } catch (e: any) {
      console.log("payment failed", id, e);
      error(500, e.message);
    }

    redirect(307, `/sent/${p.id}`);
  },
};
