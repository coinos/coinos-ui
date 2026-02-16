import { auth, get } from "$lib/utils";

export async function load({ cookies }) {
  const accounts = await get("/accounts", auth(cookies));
  const hasArk = accounts.some((a) => a.type === "ark");
  return { hasArk };
}
