import { auth, post } from "$lib/utils";
import { json, error } from "@sveltejs/kit";

export async function POST({ cookies, request }) {
  let body = await request.json();
  try {
    let res = await post("/replace", body, auth(cookies));
    return json(res);
  } catch (e) {
      error(400, e.message);
  }
}
