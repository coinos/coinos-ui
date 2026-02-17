import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies }) {
  const accounts = await get("/accounts", auth(cookies));
  const hasArk = accounts.some((a: any) => a.type === "ark");
  if (hasArk) redirect(307, "/account/seed");
  return { hasArk };
}
