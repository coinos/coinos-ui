import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, parent }) {
  const { user } = await parent();
  if (!user) redirect(307, "/login");

  const users = (await get("/users", auth(cookies))).sort(
    (a, b) => b.balance - a.balance,
  );
  return { users };
}
