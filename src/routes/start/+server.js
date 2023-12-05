import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function GET({ cookies }) {
  let token = cookies.get("token");
  let user;
  if (token) {
    user = await get("/me", auth(cookies));
    throw redirect(307, `/${user.username}`);
  }

  throw redirect(307, "/");
}
