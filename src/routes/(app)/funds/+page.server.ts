import getRates from "$lib/rates";
import { auth, get } from "$lib/utils";

export const load = async ({ cookies, parent }) => {
  const { user } = await parent();
  const funds = await get("/funds", auth(cookies));
  const rates = await getRates();
  const rate = rates[user?.currency || "USD"];
  return { funds, rate };
};
