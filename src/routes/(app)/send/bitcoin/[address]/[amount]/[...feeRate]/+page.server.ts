import { fail, redirect } from "@sveltejs/kit";
import { auth, get, post, fd } from "$lib/utils";

export async function load({ params: { address, amount, feeRate }, cookies }) {
  let aid = cookies.get("aid");

  try {
    let { fee, fees, inputs, ourfee, hex } = await post(
      "/bitcoin/fee",
      { address, amount, feeRate, aid },
      auth(cookies)
    );

    let account = await get(`/account/${aid}`, auth(cookies));

    return {
      account,
      amount,
      address,
      fee,
      fees,
      feeRate,
      ourfee,
      hex,
      inputs,
    };
  } catch (e: any) {
    return { amount, address, feeRate, message: e.message };
  }
}

export const actions = {
  default: async ({
    cookies,
    params: { address, amount, feeRate },
    request,
  }) => {
    let p;
    try {
      let body = await fd(request);
      p = await post("/bitcoin/send", body, auth(cookies));
    } catch (e: any) {
      console.log("problem sending bitcoin", e);
      return fail(400, { address, amount, feeRate, message: e.message });
    }

    redirect(307, `/sent/${p.id}`);
  },
};
