import { auth, get } from "$lib/utils";

export const load = async ({ cookies, params }) => {
  const account = await get(`/account/${params.id}`, auth(cookies));
  return { account };
};
