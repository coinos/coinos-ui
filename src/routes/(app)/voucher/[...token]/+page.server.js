import { validate } from "bitcoin-address-validation";
import bip21 from "bip21";
import { auth, get, isLiquid, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";
import { PUBLIC_DOMAIN } from "$env/static/public";
import parse from "$lib/parse";
import { test } from "$lib/parse";

export async function load({ cookies, params, request, url }) {
    await parse(params.token, url.host, cookies);
}

export const actions = {
  default: async ({ cookies, request, url }) => {
    const form = await request.formData();
    let t = form.get("text");
    let msg = await parse(t, url.host, cookies);
    return fail(400, { error: msg || "default" });
  },
};
