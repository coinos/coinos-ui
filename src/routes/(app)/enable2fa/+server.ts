import { auth, post } from "$lib/utils";

export async function POST({ cookies, request }) {
  const body = await request.json();
  const res = await post("/2fa", body, auth(cookies));

  return new Response(JSON.stringify(res));
}
