import { PUBLIC_COINOS_URL as base } from "$env/static/public";
import { auth } from "$lib/utils";

export async function POST({ cookies, fetch, params, request, url }) {
  const { path } = params;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  // Use Authorization header from request if present, otherwise fall back to cookie
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers.authorization = authHeader;
  } else {
    const token = cookies.get("token");
    if (token) Object.assign(headers, auth(cookies));
  }

  const body = await request.json();
  body.origin = url.origin;

  return fetch(`${base}/passkey/${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  });
}
