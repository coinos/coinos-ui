import { auth, post } from "$lib/utils";
import { json } from "@sveltejs/kit";

export async function POST({ cookies, request }) {
  const result = await post("/mint", await request.json(), auth(cookies));
  return json(result);
}
