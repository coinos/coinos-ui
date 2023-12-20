import { fail, redirect } from "@sveltejs/kit";
import { auth, post, fd } from "$lib/utils";

let seen = {};

export async function load({ params: { address, amount, feeRate }, cookies }) {
  try {
    let fees = await fetch(
      `https://mempool.space/api/v1/fees/recommended`
    ).then((r) => r.json());

    if (!feeRate) feeRate = fees.halfHourFee;

    let { fee, ourfee, hex } = await post(
      "/bitcoin/fee",
      { address, amount, feeRate },
      auth(cookies)
    );

    return { amount, address, fee, fees, feeRate, ourfee, hex };
  } catch (e) {
    return { message: e.message };
  }
}

export const actions = {
  default: async ({ cookies, request }) => {
    try {
      let r = await post("/bitcoin/send", await fd(request), auth(cookies));
    } catch (e) {
      return fail(400, { message: e.message });
    }

    redirect(307, "/sent");
  },
};
