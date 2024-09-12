import { fail, redirect } from "@sveltejs/kit";
import { auth, get, post, fd } from "$lib/utils";

export async function load({ params: { address, amount, feeRate }, cookies }) {
  let account = cookies.get("account");

  try {
    let { fee, fees, inputs, ourfee, hex } = await post(
      "/bitcoin/fee",
      { address, amount, feeRate, account },
      auth(cookies)
    );

    account = await get(`/account/${account}`, auth(cookies));

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
    return { account, amount, address, feeRate, message: e.message };
  }
}

export const actions = {
  default: async ({
    cookies,
    params: { address, amount, feeRate },
    request,
  }) => {
    try {
      let body = await fd(request);
      await post("/bitcoin/send", body, auth(cookies));
    } catch (e: any) {
      console.log("problem sending bitcoin", e);
      return fail(400, { address, amount, feeRate, message: e.message });
    }

    redirect(307, "/sent");
  },
};
