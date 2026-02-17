import { PUBLIC_COINOS_URL as base } from "$env/static/public";
import { auth } from "$lib/utils";

export async function POST({ cookies, fetch, params, request }) {
  const { path } = params;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers.authorization = authHeader;
  } else {
    Object.assign(headers, auth(cookies));
  }

  return fetch(`${base}/${path}`, {
    method: "POST",
    body: JSON.stringify(await request.json()),
    headers,
  });
}
