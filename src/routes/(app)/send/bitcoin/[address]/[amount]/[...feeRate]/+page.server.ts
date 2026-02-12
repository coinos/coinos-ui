import getRates from "$lib/rates";
import { auth, fd, get, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({
  params: { address, amount, feeRate },
  cookies,
  parent,
}) {
  const rates = await getRates();
  const { user } = await parent();
  const aid = cookies.get("aid") || user.id;
  const account = await get(`/account/${aid}`, auth(cookies));

  if (account.type === "ark") {
    const serverArkAddress = await get("/ark/address");
    return {
      account,
      amount,
      address,
      rate: rates[user.currency],
      serverArkAddress,
    };
  }

  try {
    const { fee, fees, inputs, ourfee, hex, subtract } = await post(
      "/bitcoin/fee",
      { address, amount, feeRate, aid },
      auth(cookies),
    );

    return {
      account,
      amount,
      address,
      fee,
      fees,
      feeRate,
      rate: rates[user.currency],
      ourfee,
      subtract,
      hex,
      inputs,
    };
  } catch (e) {
    const { message } = e as Error;
    return { amount, address, feeRate, message };
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
      const body = await fd(request);
      p = await post("/bitcoin/send", body, auth(cookies));
    } catch (e) {
      console.log("problem sending bitcoin", e);
      const { message } = e as Error;
      return fail(400, { address, amount, feeRate, message });
    }

    redirect(307, `/sent/${p.id}`);
  },
};
