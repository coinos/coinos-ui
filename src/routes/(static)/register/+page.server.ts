import { redirect } from "@sveltejs/kit";

export const load = async ({ cookies }) => {
  const token = cookies.get("token");
  const username = cookies.get("username");
  if (token && username) redirect(307, `/${username}`);

  const index = Math.floor(Math.random() * 64) + 1;

  return { index };
};
