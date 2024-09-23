import { fail, redirect } from "@sveltejs/kit";
import { fd, auth, post } from "$lib/utils";

export async function load({ cookies, params }) {
  return post("/parse", params, auth(cookies));
}

export const actions = {
  setAmount: async ({ request }) => fd(request),

  send: async ({ cookies, request }) => {
    let p;
    try {
      let body = await fd(request);

      p = await post("/payments", body, auth(cookies));
    } catch (e: any) {
      if (e.message.includes("unusable"))
        e.message = "Failed to route payment, try sending a lower amount";
      return fail(400, { message: e.message });
    }

    redirect(307, `/sent/${p.id}`);
  },
};
