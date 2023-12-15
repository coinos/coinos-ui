import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, parent }) {
  let token = cookies.get("token");
  if (!token) redirect(307, "/login");
  let user = await get("/me", auth(cookies));
  if (!user) redirect(307, "/login");

  return { user };
}
