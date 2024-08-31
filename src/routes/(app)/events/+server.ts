import { auth, post } from "$lib/utils";
import { json } from "@sveltejs/kit";

export async function POST({ cookies, request }) {
  return json(post("/event", await request.json(), auth(cookies)));
}
