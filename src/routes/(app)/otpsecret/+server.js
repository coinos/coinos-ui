import { auth, post } from '$lib/utils';
import Qr from 'qrcode-base64';
import { error } from '@sveltejs/kit';

export async function POST({ cookies, request }) {
	try {
		let body = await request.json();
		let { username, secret } = await post('/otpsecret', body, auth(cookies));
		let uri = `otpauth://totp/hashme:${username}?secret=${secret}&period=30&digits=6&algorithm=SHA1&issuer=hashme`;
		return new Response(JSON.stringify({ secret, uri, qr: Qr.drawImg(uri, { size: 600 }) }));
	} catch (e) {
		if (e.message.includes('pin')) throw e;
		throw new error(500, 'Problem saving secret');
	}
}
