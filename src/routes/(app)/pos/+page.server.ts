import { PUBLIC_COINOS_URL } from "$env/static/public";
import { fd } from "$lib/utils";
import { hex } from "@scure/base";

export const actions = {
	default: async ({ fetch, request }) => {
		const body = await fd(request);
		console.log("POSTING", body);
		const res = await fetch(`${PUBLIC_COINOS_URL}/flash`, {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				"content-type": "application/json",
				accept: "application/octet-stream",
			},
		});

		const buf = new Uint8Array(await res.arrayBuffer());
		return { data: hex.encode(buf) };
	},
};
