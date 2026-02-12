import { PUBLIC_COINOS_URL as base } from "$env/static/public";
import { auth } from "$lib/utils";

export async function POST({ cookies, fetch, params, request }) {
  const { path } = params;

  return fetch(`${base}/${path}`, {
    method: "POST",
    body: JSON.stringify(await request.json()),
    headers: { "Content-Type": "application/json", ...auth(cookies) },
  });
}
