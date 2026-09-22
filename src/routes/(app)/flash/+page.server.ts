import { PUBLIC_COINOS_URL } from "$env/static/public";
import { auth, fd, get } from "$lib/utils";
import { hex } from "@scure/base";
import { fail } from "@sveltejs/kit";

const LITTLEFS_SIZE = 0x20000;
const LITTLEFS_MAGIC = "littlefs";

// A valid image is exactly one partition long and carries the LittleFS
// superblock magic at byte 8. Anything else (e.g. a JSON error body from
// the server) must never reach the flasher.
const isLittleFS = (buf: Uint8Array) =>
	buf.length === LITTLEFS_SIZE &&
	new TextDecoder().decode(buf.subarray(8, 8 + LITTLEFS_MAGIC.length)) ===
		LITTLEFS_MAGIC;

export async function load({ cookies }) {
	let token;

	try {
		token = await get("/ro", auth(cookies));
	} catch (e) {}

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

		if (!res.ok) {
			let message = `Config server returned ${res.status}`;
			try {
				message = JSON.parse(new TextDecoder().decode(buf)).message || message;
			} catch (e) {}
			return fail(res.status >= 400 && res.status < 600 ? res.status : 500, {
				error: message,
			});
		}

		if (!isLittleFS(buf))
			return fail(500, {
				error: `Config server returned an invalid image (${buf.length} bytes)`,
			});

		return { bytes: hex.encode(buf) };
	},
};
