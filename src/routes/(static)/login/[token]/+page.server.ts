import { redirect } from "@sveltejs/kit";

export const load = async ({ cookies, params }) => {
  const { token } = params;
  const maxAge = 380 * 24 * 60 * 60;

  const expires = new Date();
  expires.setSeconds(expires.getSeconds() + maxAge);

  const opts = { path: "/", expires };
  cookies.set("token", token, opts);
  redirect(307, "/login");
};
