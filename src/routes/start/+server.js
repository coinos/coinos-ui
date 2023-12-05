import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function GET({ cookies }) {
  let username = cookies.get("username");
  if (username) {
    throw redirect(307, `/${username}/receive`);
  }

  throw redirect(307, "/");
}
