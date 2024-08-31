import { redirect } from "@sveltejs/kit";
  import { get, auth, protectedRoutes } from "$lib/utils";

export async function load({ cookies, request, url, params }) {
  let { pathname } = url;
  let token = cookies.get("token");
  let rate,
    rates = { USD: 1 };

  let user;
  if (token) {
    try {
      user = await get("/me", auth(cookies));
    } catch (e) {}
  }

  if (user?.needsMigration) {
    redirect(307, `/migrate`);
  }

  if (
    user &&
    ["/login", "/register"].includes(pathname) &&
    request.method === "GET"
  ) {
    redirect(307, `/${user.username}`);
  }

  if (
    protectedRoutes.find((p) => pathname.match(p)) &&
    (!user || user.username !== params.username)
  ) {
    redirect(307, "/login");
  }

  if (user && !user.pubkey && !pathname.includes("generate")) {
    redirect(303, `/${user.username}/generate`);
  }

  try {
    rate = await get("/rate");
    rates = await get("/rates");
  } catch (e) {
    console.log(e);
  }

  return { user, token, rate, rates };
}
