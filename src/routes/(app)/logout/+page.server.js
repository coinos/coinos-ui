import { redirect } from "@sveltejs/kit";

const opts = {
  expires: new Date(0),
  path: "/",
};

export async function load({ cookies }) {
  cookies.set("username", "", opts);
  cookies.set("token", "", opts);
  redirect(307, "/login");
}
