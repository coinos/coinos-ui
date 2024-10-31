import Qr from "qrcode-base64";

export async function load({ params }) {
	const { text } = params;
	const src = Qr.drawImg(text, { size: 600 });

	return { src, text };
}
