import Qr from 'qrcode-base64';

export async function load({ params, url }) {
	let text = `${encodeURI(params.username)}@${url.hostname}`;
	let src = Qr.drawImg(text, { size: 300 });
	return { src, text };
}
