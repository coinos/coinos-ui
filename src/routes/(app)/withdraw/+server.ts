import { auth, post } from "$lib/utils";

export async function POST({ cookies, request }) {
  const body = await request.json();
  await post("/payments", body, auth(cookies));

  return new Response(JSON.stringify("ok"), {
    headers: { "content-type": "application/json" },
  });
}
