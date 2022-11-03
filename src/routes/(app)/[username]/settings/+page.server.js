import { invalid } from '@sveltejs/kit';
import { auth, get, post } from '$lib/utils';
import Qr from 'qrcode-base64';

export async function load({ locals: { user } }) {
	return {
		otpQr: Qr.drawImg(
			`otpauth://totp/coinos:${user.username}?secret=${user.otpsecret}&period=30&digits=6&algorithm=SHA1&issuer=coinos`,
			{ size: 600 }
		)
	};
}

export const actions = {
	default: async ({ cookies, locals, request }) => {
		let form = Object.fromEntries(await request.formData());

		let user = {
			...locals.user,
			...form
		};

		try {
			await post(`/user`, user, auth(cookies));
		} catch (e) {
			return invalid(400, { message: e.message });
		}

		return { success: true };
	}
};
