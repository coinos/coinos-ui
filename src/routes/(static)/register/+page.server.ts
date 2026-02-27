import { redirect } from "@sveltejs/kit";

export const load = async ({ parent }) => {
  const { user } = await parent();
  if (user) redirect(307, `/${user.username}`);

  const index = Math.floor(Math.random() * 64) + 1;

  return { index };
};
