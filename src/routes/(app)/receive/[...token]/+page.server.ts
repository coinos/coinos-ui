import { auth, fd, get, post } from "$lib/utils";
import { error, fail, redirect } from "@sveltejs/kit";
import parse from "$lib/parse";

export async function load({ cookies, params, parent, url }) {
  let { user } = await parent();
  if (!user) redirect(307, `/register?redirect=${url.pathname}`);
  await parse(params.token, url.host, cookies);
}

export const actions = {
  default: async ({ cookies, request, url }) => {
    let { text } = await fd(request);
    let msg = await parse(text, url.host, cookies);
    return fail(400, { error: msg || "default" });
  },
};
