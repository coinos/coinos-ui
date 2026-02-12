import { auth, get } from "$lib/utils";

export const load = async ({ cookies, params }) => {
  const { id } = params;
  const p = await get(`/payments/${id}`, auth(cookies));
  return p;
};
