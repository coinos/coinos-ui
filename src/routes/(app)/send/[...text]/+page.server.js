import { auth, fd, get } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";
import parse from "$lib/parse";

export async function load({ cookies, params, request, url }) {
  let { text } = params;

  await parse(text, url.host, cookies);
  let contacts = await get("/contacts", auth(cookies));
  return { contacts };
}

export const actions = {
  default: async ({ cookies, request, url }) => {
    let { text } = await fd(request);
    let msg = await parse(text, url.host, cookies);
    return fail(400, { error: msg || "default" });
  },
};
