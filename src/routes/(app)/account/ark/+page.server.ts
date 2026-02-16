import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, parent }) {
  const { user } = await parent();
  const accounts = await get("/accounts", auth(cookies));
  if (accounts.some((a) => a.type === "ark")) {
    redirect(307, `/${user.username}`);
  }
}
