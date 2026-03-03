import { redirect } from "@sveltejs/kit";

export async function load({ cookies, parent }) {
  if (!cookies.get("token")) redirect(307, "/login");
  const { user } = await parent();
  if (!user) redirect(307, "/login");
  return { user };
}
