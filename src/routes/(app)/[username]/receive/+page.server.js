import { redirect } from "@sveltejs/kit";
import * as Qr from "qrcode-base64";

export const load = async ({ cookies, params, url }) => {
	const token = cookies.get("token");
	if (!token) redirect(307, `/pay/${params.username}`);

	const username = cookies.get("username");

	const text = `${username}@${url.host}`;
	const src = Qr.drawImg(text, { size: 500 });

	return { src, text };
};
