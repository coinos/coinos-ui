import { fd, auth, get, post } from "$lib/utils";
import { error, fail, redirect } from "@sveltejs/kit";

export async function load({ params, parent }) {
  let { rates, user } = await parent();
  if (!user) redirect(307, "/register");

  let data;

  try {
    let { lnurl } = params;
    data = await get(`/decode?text=${lnurl}`);
  } catch (e) {
    error(500, e.message);
  }

  let currencies = [
    {
      code: "BRL",
      name: "Reais",
      symbol: "R$",
      decimals: 2,
      multiplier: 2932.290939091977,
      convertible: { max: 100000, min: 100 },
    },
    {
      code: "USDT",
      name: "Tether",
      symbol: "$",
      decimals: 6,
      multiplier: 1.4602808876678048,
      convertible: { max: 200000000, min: 200000 },
    },
  ];

  if (data.currencies) {
    data.currencies.map(
      (c) => (rates[c.code] = c.multiplier * 10 ** (c.decimals - 3) * 1000)
    );
  }

  data.rates = rates;

  if (!["payRequest", "withdrawRequest"].includes(data.tag))
    error(500, "We only support LNURLp and LNURLw at this time");

  return data;
}

const convertAmount = (amount, multiplier, decimals) => {
  const conversionFactor = multiplier * 10 ** (decimals - 3);
  const convertedAmount = amount / conversionFactor;

  return convertedAmount.toFixed(decimals);
};

export const actions = {
  pay: async ({ cookies, fetch, request }) => {
    let error;

    let { callback, amount, minSendable, maxSendable } = await fd(request);
    minSendable = Math.round(minSendable / 1000);
    maxSendable = Math.round(maxSendable / 1000);



    if (amount < minSendable)
      error = `Amount must be at least ${minSendable} sats`;
    if (amount > maxSendable)
      error = `Amount must be at most ${maxSendable} sats`;
    if (error) return fail(400, { error });

    const a = currency
      ? `${Math.trunc(+amount * 10 ** currency.decimals)}.${currency.code}`
      : (+amount * 1000).toString();

    let { pr } = await fetch(`${callback}?amount=${a}`).then((r) =>
      r.json()
    );
    redirect(307, `/send/lightning/${pr}`);
  },

  withdraw: async ({ cookies, fetch, request }) => {
    let error;

    let {
      callback,
      amount,
      username,
      currency,
      minWithdrawable,
      maxWithdrawable,
      k1,
    } = await fd(request);

    minWithdrawable = Math.round(minWithdrawable / 1000);
    maxWithdrawable = Math.round(maxWithdrawable / 1000);

    if (amount < minWithdrawable)
      error = `Amount must be at least ${minWithdrawable} sats`;
    if (amount > maxWithdrawable)
      error = `Amount must be at most ${maxWithdrawable} sats`;
    if (error) return fail(400, { error });

    let invoice = { amount, type: "lightning" };
    let user = { username, currency };

    let { text: pr } = await post("/invoice", { invoice, user }, auth(cookies));

    let c = callback.includes("?") ? "&" : "?";
    await fetch(`${callback}${c}k1=${k1}&pr=${pr}`).then((r) => r.json());

    redirect(307, `/ln/withdrawal/sent`);
  },
};
