import { validate } from "bitcoin-address-validation";
import bip21 from "bip21";
import { auth, get, isLiquid, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";
import { PUBLIC_DOMAIN } from "$env/static/public";

let parse = async (t, host) => {
  if (!t) return;

  if (t.startsWith("http")) redirect(307, t);
  if (t.startsWith(host)) redirect(307, `http://${t}`);

  let amount, user, id;

  t = t.trim();
  t.toLowerCase().startsWith("bitcoin:") &&
    ({
      address: t,
      options: { amount },
    } = bip21.decode(t));

  if (t.endsWith(`@${PUBLIC_DOMAIN}`)) t = t.split("@")[0];
  if (t.includes("@") && t.includes(".")) {
    try {
      t = await get(`/encode?address=${t}`);
    } catch (e) {}
  }

  if (t.includes("/fund")) redirect(307, t.substring(t.indexOf("/fund")));

  // lightning
  if (t.toLowerCase().startsWith("lightning:")) t = t.toLowerCase().replace("lightning:", "");
  if (t.toLowerCase().startsWith("lnurl")) redirect(307, `/ln/${t}`);
  if (t.includes(":")) t = t.split(":")[1];

  if (t.toLowerCase().startsWith("ln")) {
    try {
      ({ id } = await get(`/invoice/${t}`));
    } catch (e) {
      redirect(307, `/send/lightning/${t}`);
    }
  }

  // bitcoin
  if (validate(t) || isLiquid(t)) {
    try {
      ({ id, user } = await get(`/invoice/${t}`));
    } catch (e) {
      let r = `/send/bitcoin/${t}`;
      if (amount) r += "/" + amount;
      redirect(307, r);
    }

    if (user) redirect(307, `/send/${user.username}`);
    else if (id) redirect(307, `/send/${id}`);
  }

  // user
  try {
    user = await get(`/users/${t.split("/")[0]}`);
    if (user.anon) user = null;
  } catch (e) {}

  if (user) redirect(307, `/send/user/${t}`);

  let fund;
  try {
    fund = await get(`/fund/${t}`);
  } catch (e) {}

  if (fund) redirect(307, `/send/fund/${t}`);

  // invoice
  let invoice;
  try {
    invoice = await get(`/invoice/${t}`);
  } catch (e) {}

  if (invoice) redirect(307, `/send/invoice/${invoice.hash}`);
};

export async function load({ cookies, params, request, url }) {
  let { text } = params;
  await parse(text, url.host);
  let contacts = await get("/contacts", auth(cookies));
  return { contacts };
}

export const actions = {
  default: async ({ request, url }) => {
    const form = await request.formData();
    let t = form.get("text");
    await parse(t, url.host);
    return fail(400, { error: true });
  },
};
