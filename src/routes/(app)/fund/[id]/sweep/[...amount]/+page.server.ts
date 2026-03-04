import { randomName, randomPassword } from "$lib/random";
import getRates from "$lib/rates";
import { auth, get, post, register, sats } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export async function load({ cookies, request, params, parent }) {
  let { user } = await parent();
  const { id } = params;
  const parts = params.amount.split("/");

  let amount: string | undefined;
  let currency: string | undefined;
  let authId: string | undefined;

  let urlHasCurrency = false;
  if (parts[0] === "auth") {
    authId = parts[1];
  } else {
    amount = parts[0];
    currency = parts[1];
    if (currency) urlHasCurrency = true;
  }

  if (!currency) currency = user?.currency;
  if (currency) currency = currency.toUpperCase();
  const rates = await getRates();
  const rate = rates[currency || "USD"];
  if (currency && !rate) error(500, "Invalid currency symbol");

  if (!amount) {
    const balance = await get(`/fund/${id}`);
    if (authId) {
      const a = balance.authorizations?.find((a: any) => a.authId === authId);
      if (a) amount = a.amount;
    }
    if (!amount && balance.authorizations?.length) {
      const a = balance.authorizations[0];
      authId = a.authId;
      amount = a.amount;
    }
    if (!amount) amount = balance.amount;
  } else if (urlHasCurrency) {
    amount = String(Math.round((Number(amount) * sats) / rate));
  }

  const username = randomName() + Math.floor(Math.random() * 99) + 1;
  const password = randomPassword();

  if (!amount) redirect(307, `/fund/${id}`);
  if (!user) {
    const ip = request.headers.get("cf-connecting-ip");

    user = {
      username,
      password,
      fresh: true,
    };

    let redirectUrl = `/fund/${id}/sweep`;
    if (params.amount) redirectUrl += `/${params.amount}`;

    const extraHeaders: Record<string, string> = {};
    if (env.INTERNAL_API_KEY) extraHeaders["x-api-key"] = env.INTERNAL_API_KEY;

    await register(user, ip, cookies, redirectUrl, undefined, extraHeaders);
  }

  try {
    ({ amount } = await post("/take", { amount, id, authId }, auth(cookies)));
  } catch {
    redirect(307, `/fund/${id}`);
  }

  return { amount, currency, id, rate, rates, password };
}
