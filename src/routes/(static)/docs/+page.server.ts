import { auth, get } from "$lib/utils";
export const load = async ({ cookies }) => {
  const token = cookies.get("token");
  let ro;
  if (token) ro = await get("/ro", auth(cookies));
  return { ro, token };
};
