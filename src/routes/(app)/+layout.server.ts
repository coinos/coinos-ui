import { get } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";

export async function load({ cookies, request, url, params, parent }) {
  const { pathname } = url;
  const { id, username } = params;
  const token = cookies.get("token");

  const { user } = await parent();

  let subject;

  if (url.pathname.includes("/invoice") && id) {
    try {
      ({ user: subject } = await get(`/invoice/${id}`));
    } catch (e) {
      console.log("unable to fetch invoice", id, e);
    }
  } else if (username) {
    try {
      subject = await get(`/users/${username}`);
    } catch {
      error(500, "Unable to retrieve user account data");
    }
  }

  if (user?.needsMigration) {
    redirect(307, "/migrate");
  }

  if (user && ["/login", "/register"].includes(pathname) && request.method === "GET") {
    redirect(307, `/${user.username}`);
  }

  const theme = cookies.get("theme") || "light";

  return { user, token, subject, theme };
}
