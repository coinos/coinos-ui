import { PUBLIC_COINOS_URL } from "$env/static/public";
import { fd } from "$lib/utils";
import { hex } from "@scure/base";

export const actions = {
  default: async ({ fetch, request }) => {
    const body = await fd(request);
    const res = await fetch(`${PUBLIC_COINOS_URL}/printer`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        accept: "application/octet-stream",
      },
    });

    return { data: hex.encode(new Uint8Array(await res.arrayBuffer())) };
  },
};
