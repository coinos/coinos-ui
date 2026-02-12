import { auth, post } from "$lib/utils";
import { json } from "@sveltejs/kit";

export async function POST({ cookies, request }) {
  const body = await request.json();
  const result = await post("/subscription/delete", body, auth(cookies));
  return json(result);
}
