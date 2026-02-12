import getRates from "$lib/rates";
import { redirect } from "@sveltejs/kit";

export const load = async ({ cookies, params: { username }, parent, url }) => {
  const token = cookies.get("token");
  const rates = await getRates();
  if (!token) redirect(307, `/pay/${username}`);
  const { subject, user } = await parent();
  const aid = cookies.get("aid");

  if (aid && user?.id !== aid) redirect(307, "/invoice");
  return {
    rate: rates[subject.currency],
    text: `${username}@${url.host}`,
  };
};
