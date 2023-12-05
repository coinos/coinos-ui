import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function GET({ cookies }) {
  let token = cookies.get("user");
  if (user) {
    throw redirect(307, `/${user}/receive`);
  }

  throw redirect(307, "/");
}
