import { env } from "$env/dynamic/private";
import { error, fail, redirect } from "@sveltejs/kit";
import { post, auth } from "$lib/utils";
import { createTicket } from "$lib/ticket";

export let load = async ({ cookies }) => {
	let invoice = await post('/invoice', { invoice: { type: 'bitcoin' }}, auth(cookies));
	let { hash } = invoice;
  return { address: hash };
}

export const actions = {
  default: async ({ cookies, request }) => {
    let form = await request.formData();

    let amount = parseFloat(form.get("amount"));
    if (!amount || amount < 0 || amount > 500)
      return fail(400, { message: "Invalid amount" });

    await post(
      "/buy",
      {
        amount: form.get("amount"),
        number: form.get("number").replace(/\s+/g, ""),
        month: form.get("expiry").slice(0, 2),
        year: form.get("expiry").slice(-2),
        cvc: form.get("cvc"),
      },
      auth(cookies)
    );

    throw redirect(307, `/${form.get("username")}/payments`);
  },
};
