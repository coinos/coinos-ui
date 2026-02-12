import { auth, fd, get, post } from "$lib/utils";
import { fail } from "@sveltejs/kit";

export const load = async ({ params: { id } }) => {
  const managers = await get(`/fund/${id}/managers`);
  return { managers, id };
};

export const actions = {
  default: async ({ cookies, request }) => {
    const form = await fd(request);

    try {
      const managers = await post("/fund/managers", form, auth(cookies));

      return { managers };
    } catch (e) {
      const { message } = e as Error;
      return fail(400, { message });
    }
  },
};
