import getRates from "$lib/rates";
import { auth, fd, get, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ params: { address, amount }, cookies, parent, url }) {
  const rates = await getRates();
  const { user } = await parent();
  let aid = url.searchParams.get("aid") || cookies.get("aid") || user.id;

  let account = await get(`/account/${aid}`, auth(cookies));

  if (account.type === "bitcoin") {
    const inv = await post(
      "/invoice",
      {
        invoice: {
          type: "bitcoin",
          amount: parseInt(amount),
          forward: address,
        },
        user,
      },
      auth(cookies),
    );
    redirect(307, `/send/bitcoin/${inv.hash}/${amount}`);
  }

  const rate = rates[user.currency];
  const serverArkAddress = account.type === "ark" ? await get("/ark/address") : null;

  // Check if destination is the user's own vault address (custodial ark invoice)
  const isCustodialForward = account.type === "ark" && address === account.arkAddress;

  return {
    account,
    amount,
    address,
    rate,
    serverArkAddress,
    isCustodialForward,
  };
}

export const actions = {
  default: async ({ cookies, params: { address, amount, feeRate }, request }) => {
    let p;
    try {
      const body = await fd(request);
      p = await post("/ark/send", { ...body, address, amount: parseInt(amount) }, auth(cookies));
    } catch (e) {
      console.log("problem sending bitcoin", e);
      const { message } = e as Error;
      return fail(400, { address, amount, feeRate, message });
    }

    redirect(307, `/sent/${p.id}`);
  },
};
