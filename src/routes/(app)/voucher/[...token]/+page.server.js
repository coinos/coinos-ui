import { validate } from "bitcoin-address-validation";
import bip21 from "bip21";
import { auth, get, isLiquid, post } from "$lib/utils";
import { error, fail, redirect } from "@sveltejs/kit";
import { PUBLIC_DOMAIN } from "$env/static/public";
import parse from "$lib/parse";
import { test } from "$lib/parse";

export async function load({ cookies, params, parent, request, url }) {
  let { user } = await parent();
  if (!user) redirect(307, `/register?redirect=${url.pathname}`);

  let { token } = params;
  if (token && !token.startsWith("cashu"))
    ({ token } = await get(`/cash/${token}`));
  await parse(token, url.host, cookies);

  if (token) error(409, "Token could not be redeemed. Was it already spent?");
}

export const actions = {
  default: async ({ cookies, request, url }) => {
    const form = await request.formData();
    let t = form.get("text");
    if (t.startsWith("cashu")) {
      let { id } = await post("/cash", { token: t }, auth);
      redirect(307, `/ecash/${id}`);
    }
    let msg = await parse(t, url.host, cookies);
    return fail(400, { error: msg || "default" });
  },
};
