import { auth, post } from "$lib/utils";
import { json, error } from "@sveltejs/kit";

export async function POST({ cookies, request }) {
  const body = await request.json();
  try {
    const res = await post("/replace", body, auth(cookies));
    return json(res);
  } catch (e: any) {
    error(400, e.message);
  }
}
