import { redirect } from "@sveltejs/kit";

export async function GET({ cookies }) {
  const pathname = cookies.get("pathname");
  const username = cookies.get("username");
  if (username) {
    if (pathname) redirect(307, pathname);
    else redirect(307, `/${username}`);
  }

  redirect(307, "/");
}
