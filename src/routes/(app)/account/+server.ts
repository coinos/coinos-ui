import { auth, post } from "$lib/utils";
import { error, json } from "@sveltejs/kit";

export async function POST({ cookies, request }) {
  try {
    let body = await request.json();
    return json(await post(`/accounts`, body, auth(cookies)));
  } catch (e: any) {
    console.log(e);
    error(500, e.message);
  }
}
