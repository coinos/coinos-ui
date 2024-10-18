import { fd } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";
import parse from "$lib/parse";

export async function load({ params, parent, url }) {
  let { user } = await parent();
  if (!user) redirect(307, `/register?redirect=${url.pathname}`);
  await parse(params.token, url.host);
}

export const actions = {
  default: async ({ request, url }) => {
    let { text } = await fd(request);
    await parse(text, url.host);
    return fail(400, { error: "default" });
  },
};
