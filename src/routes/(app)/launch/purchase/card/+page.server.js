import { env } from "$env/dynamic/private";
import { error, redirect } from "@sveltejs/kit";
import { post, auth } from "$lib/utils";
import { createTicket } from "$lib/ticket";

let stripe = "https://api.stripe.com/v1";

export const actions = {
  default: async ({ cookies, request }) => {
    let form = await request.formData();

    let headers = new Headers();
    headers.set(
      "Authorization",
      "Basic " + new Buffer(env.STRIPE + ":").toString("base64")
    );

    let body = new URLSearchParams({
      "card[number]": form.get("number").replace(/\s+/g, ""),
      "card[exp_month]": form.get("expiry").slice(0, 2),
      "card[exp_year]": form.get("expiry").slice(-2),
      "card[cvc]": form.get("cvc"),
    });

    let method = "POST";

    let { id: source } = await fetch(`${stripe}/tokens`, {
      body,
      headers,
      method,
    }).then((r) => r.json());

    body = new URLSearchParams({
      amount: 600,
      currency: "cad",
      source,
      description: "launch ticket",
    });

    let { status } = await fetch(`${stripe}/charges`, {
      body,
      headers,
      method,
    }).then((r) => r.json());

    if (status !== "succeeded") error(500, { message: "Card payment failed" });
    let asset = await createTicket(cookies, form.get("username"));

    redirect(307, `/launch/thanks/${asset}`);
  },
};
