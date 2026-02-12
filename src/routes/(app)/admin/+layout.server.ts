import { auth, get, isInvalidTokenError } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies }) {
  const token = cookies.get("token");
  if (!token) redirect(307, "/login");
  let user;
  try {
    user = await get("/me", auth(cookies));
  } catch (e) {
    if (isInvalidTokenError(e)) redirect(307, "/logout");
    throw e;
  }
  if (!user) redirect(307, "/login");

  return { user };
}
