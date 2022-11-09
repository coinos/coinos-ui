import { auth, post } from '$lib/utils';
import Qr from 'qrcode-base64';
import { error } from '@sveltejs/kit';

export async function POST({ cookies, locals, request }) {
	try {
		let { secret } = await post('/otpsecret', await request.json(), auth(cookies));
		let uri = `otpauth://totp/coinos:${locals.user.username}?secret=${secret}&period=30&digits=6&algorithm=SHA1&issuer=coinos`;
		return new Response(JSON.stringify({ secret, uri, qr: Qr.drawImg(uri, { size: 600 }) }));
	} catch (e) {
		throw new error(500, 'Problem saving secret');
	}
}
