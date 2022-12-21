import { get } from '$lib/utils';
import Qr from 'qrcode-base64';

export async function load({ params, url }) {
	let { username } = params;
	let text = `${encodeURI(username)}@${url.hostname}`;
	let src = Qr.drawImg(text, { size: 300 });
	let events = [];
  console.log("EV", events)

	try {
		events = await get(`/${username}/events`);
	} catch (e) {
		console.log(e);
	}

	return { events, src, text };
}
