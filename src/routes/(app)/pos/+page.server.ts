import { PUBLIC_COINOS_URL } from "$env/static/public";
import { auth, fd, get } from "$lib/utils";
import { hex } from "@scure/base";

export async function load({ cookies }) {
  let token;

  try {
    token = await get("/ro", auth(cookies));
  } catch {}

  return { token };
}

export const actions = {
  default: async ({ fetch, request }) => {
    const body = await fd(request);
    const res = await fetch(`${PUBLIC_COINOS_URL}/flash`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        accept: "application/octet-stream",
      },
    });

    const buf = new Uint8Array(await res.arrayBuffer());
    return { bytes: hex.encode(buf) };
  },
};
