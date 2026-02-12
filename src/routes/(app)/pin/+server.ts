import { json } from "@sveltejs/kit";
import { auth, post } from "$lib/utils";

export async function POST({ cookies, request }) {
  const result = await post("/pin", await request.json(), auth(cookies));
  return json(result);
}
