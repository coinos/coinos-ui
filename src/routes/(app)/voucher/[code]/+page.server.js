import { get } from '$lib/utils';
import Qr from 'qrcode-base64';
export let load = async ({ params: { code }, url }) => {
	let payment = await get(`/payment/${code}`);

	let src = Qr.drawImg(url.hostname, { size: 300 });
	return { payment, src };
};
