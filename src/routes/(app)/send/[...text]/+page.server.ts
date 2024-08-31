import { auth, fd, get } from "$lib/utils";
import { fail } from "@sveltejs/kit";
import parse from "$lib/parse";

export async function load({ cookies, params, url }) {
  let { text } = params;

  await parse(text, url.host);
  let contacts = await get("/contacts", auth(cookies));
  return { contacts };
}

export const actions = {
  default: async ({ request, url }) => {
    let { text } = await fd(request);
      await parse(text, url.host);
    return fail(400, { error: "default" });
  },
};
