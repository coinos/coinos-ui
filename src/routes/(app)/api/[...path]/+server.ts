import { PUBLIC_COINOS_URL as base } from "$env/static/public";
import { auth } from "$lib/utils";

function getHeaders(cookies, request) {
  const headers: Record<string, string> = {};
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers.authorization = authHeader;
  } else {
    Object.assign(headers, auth(cookies));
  }
  return headers;
}

export async function GET({ cookies, fetch, params, request }) {
  return fetch(`${base}/${params.path}`, { headers: getHeaders(cookies, request) });
}

export async function POST({ cookies, fetch, params, request }) {
  return fetch(`${base}/${params.path}`, {
    method: "POST",
    body: JSON.stringify(await request.json()),
    headers: { "Content-Type": "application/json", ...getHeaders(cookies, request) },
  });
}
