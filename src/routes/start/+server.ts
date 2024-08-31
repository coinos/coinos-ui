import { redirect } from "@sveltejs/kit";

export async function GET({ cookies }) {
  let username = cookies.get("username");
  if (username) {
    redirect(307, `/${username}/receive`);
  }

  redirect(307, "/");
}
